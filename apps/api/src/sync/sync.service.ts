import { Injectable, UnauthorizedException } from '@nestjs/common'
import {
  ExerciseSchema,
  MeasurementSchema,
  ProfileSchema,
  SYNC_BATCH_LIMIT,
  WorkoutSchema,
  type SyncChanges,
  type SyncEntity,
  type SyncPullResponse,
  type SyncPushResponse,
  type SyncRejection,
} from '@gymlog/schemas'
import type { z } from 'zod'
import { formatIssues } from '../common/zod-validation.pipe.js'
import type { Prisma } from '../generated/prisma/client.js'
import { PrismaService } from '../prisma/prisma.service.js'
import {
  exerciseFromRow,
  exerciseToRow,
  measurementFromRow,
  measurementToRow,
  profileFromRow,
  profileToRow,
  workoutFromRow,
  workoutToRow,
} from './records.js'

type PushEnvelope = {
  workouts: unknown[]
  exercises: unknown[]
  measurements: unknown[]
  profile: unknown
}

type SyncRecord = { id: string; updatedAt: string }

const readId = (item: unknown): string | null =>
  typeof item === 'object' && item !== null && 'id' in item && typeof item.id === 'string'
    ? item.id
    : null

/**
 * Validates records one by one: valid ones are returned, invalid ones go to `rejected`
 * (the same idea as restoreItems on the frontend — one bad record doesn't sink the rest).
 */
const validateEach = <T>(
  entity: SyncEntity,
  schema: z.ZodType<T>,
  items: unknown[],
  rejected: SyncRejection[],
): T[] =>
  items.flatMap((item) => {
    const result = schema.safeParse(item)
    if (result.success) return [result.data]
    rejected.push({ entity, id: readId(item), issues: formatIssues(result.error) })
    return []
  })

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async push(userId: string, body: PushEnvelope): Promise<SyncPushResponse> {
    const rejected: SyncRejection[] = []
    const workouts = validateEach('workout', WorkoutSchema, body.workouts, rejected)
    const exercises = validateEach('exercise', ExerciseSchema, body.exercises, rejected)
    const measurements = validateEach('measurement', MeasurementSchema, body.measurements, rejected)
    const [profile] =
      body.profile === null ? [] : validateEach('profile', ProfileSchema, [body.profile], rejected)

    const counters = await this.prisma.$transaction(
      async (tx) => {
        // Row lock on the user: parallel pushes of the same user (two devices) run one after
        // another, so revisions are committed in increasing order. Without it a push could
        // commit revision 10 after a pull already moved the cursor past 11 — and 10 is lost.
        const [user] = await tx.$queryRaw<{ revision: number }[]>`
          SELECT "revision" FROM "User" WHERE "id" = ${userId}::uuid FOR UPDATE`
        if (!user) throw new UnauthorizedException()

        let revision = user.revision
        let applied = 0
        let skipped = 0

        /** Last write wins: the record is written only if it's newer than the stored one. */
        const applyLww = async <T extends SyncRecord>(
          records: T[],
          findStored: (ids: string[]) => Promise<{ id: string; updatedAt: Date }[]>,
          upsert: (record: T, revision: number) => Promise<unknown>,
        ) => {
          if (records.length === 0) return
          const stored = await findStored(records.map((record) => record.id))
          const storedUpdatedAt = new Map(stored.map((row) => [row.id, row.updatedAt.getTime()]))

          for (const record of records) {
            const updatedAt = Date.parse(record.updatedAt)
            const current = storedUpdatedAt.get(record.id)
            // Equal timestamps count as "already have it": retries of the same push are no-ops.
            if (current !== undefined && current >= updatedAt) {
              skipped++
              continue
            }
            revision++
            await upsert(record, revision)
            storedUpdatedAt.set(record.id, updatedAt)
            applied++
          }
        }

        const where = (ids: string[]) => ({ userId, id: { in: ids } })
        const select = { id: true, updatedAt: true } as const

        await applyLww(
          workouts,
          (ids) => tx.workout.findMany({ where: where(ids), select }),
          (workout, rev) => {
            const data = { ...workoutToRow(workout), revision: rev }
            return tx.workout.upsert({
              where: { userId_id: { userId, id: workout.id } },
              create: { userId, id: workout.id, ...data },
              update: data,
            })
          },
        )
        await applyLww(
          exercises,
          (ids) => tx.exercise.findMany({ where: where(ids), select }),
          (exercise, rev) => {
            const data = { ...exerciseToRow(exercise), revision: rev }
            return tx.exercise.upsert({
              where: { userId_id: { userId, id: exercise.id } },
              create: { userId, id: exercise.id, ...data },
              update: data,
            })
          },
        )
        await applyLww(
          measurements,
          (ids) => tx.measurement.findMany({ where: where(ids), select }),
          (measurement, rev) => {
            const data = { ...measurementToRow(measurement), revision: rev }
            return tx.measurement.upsert({
              where: { userId_id: { userId, id: measurement.id } },
              create: { userId, id: measurement.id, ...data },
              update: data,
            })
          },
        )

        // The profile is a singleton without id/createdAt; `updatedAt: null` means
        // "never edited" and never overwrites a stored profile.
        if (profile) {
          const stored = await tx.profile.findUnique({ where: { userId } })
          const incoming = profile.updatedAt === null ? null : Date.parse(profile.updatedAt)
          const current = stored?.updatedAt?.getTime() ?? null
          if (incoming === null || (current !== null && current >= incoming)) {
            skipped++
          } else {
            revision++
            const data = { ...profileToRow(profile), revision }
            await tx.profile.upsert({ where: { userId }, create: { userId, ...data }, update: data })
            applied++
          }
        }

        if (revision !== user.revision) {
          await tx.user.update({ where: { id: userId }, data: { revision } })
        }
        return { applied, skipped }
      },
      // Up to SYNC_BATCH_LIMIT upserts one by one: give it more than the default 5 s.
      { timeout: 30_000 },
    )

    return { ...counters, rejected }
  }

  async pull(userId: string, cursor: number): Promise<SyncPullResponse> {
    const where = { userId, revision: { gt: cursor } }
    const orderBy = { revision: 'asc' } as const
    // One extra row per table tells whether anything is left after this page.
    const take = SYNC_BATCH_LIMIT + 1

    // One snapshot for all four reads: otherwise a push committed between them could show
    // its later revisions from one table while hiding its earlier ones from another,
    // and the cursor would jump over them.
    const [workouts, exercises, measurements, profile] = await this.prisma.$transaction(
      [
        this.prisma.workout.findMany({ where, orderBy, take }),
        this.prisma.exercise.findMany({ where, orderBy, take }),
        this.prisma.measurement.findMany({ where, orderBy, take }),
        this.prisma.profile.findFirst({ where }),
      ],
      { isolationLevel: 'RepeatableRead' satisfies Prisma.TransactionIsolationLevel },
    )

    // Revisions are unique per user across all tables, so merging by revision gives one
    // ordered stream; the page is its first SYNC_BATCH_LIMIT changes.
    type Change = { revision: number; add: (changes: SyncChanges) => void }
    const all: Change[] = [
      ...workouts.map((row) => ({
        revision: row.revision,
        add: (changes: SyncChanges) => changes.workouts.push(workoutFromRow(row)),
      })),
      ...exercises.map((row) => ({
        revision: row.revision,
        add: (changes: SyncChanges) => changes.exercises.push(exerciseFromRow(row)),
      })),
      ...measurements.map((row) => ({
        revision: row.revision,
        add: (changes: SyncChanges) => changes.measurements.push(measurementFromRow(row)),
      })),
      ...(profile
        ? [
            {
              revision: profile.revision,
              add: (changes: SyncChanges) => {
                changes.profile = profileFromRow(profile)
              },
            },
          ]
        : []),
    ].sort((a, b) => a.revision - b.revision)

    const page = all.slice(0, SYNC_BATCH_LIMIT)
    const changes: SyncChanges = { workouts: [], exercises: [], measurements: [], profile: null }
    for (const change of page) change.add(changes)

    return {
      changes,
      cursor: page.at(-1)?.revision ?? cursor,
      hasMore: all.length > SYNC_BATCH_LIMIT,
    }
  }
}

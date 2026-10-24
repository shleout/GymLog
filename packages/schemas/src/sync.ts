import { z } from 'zod'
import { ExerciseSchema } from './exercise.js'
import { MeasurementSchema } from './measurement.js'
import { ProfileSchema } from './profile.js'
import { WorkoutSchema } from './workout.js'

/** Max records (all collections together) in one push and in one pull page. */
export const SYNC_BATCH_LIMIT = 500

export const SYNC_ENTITIES = ['workout', 'exercise', 'measurement', 'profile'] as const
export const SyncEntitySchema = z.enum(SYNC_ENTITIES)

/** Records changed since some point, as both push and pull carry them. */
export const SyncChangesSchema = z.object({
  workouts: z.array(WorkoutSchema),
  exercises: z.array(ExerciseSchema),
  measurements: z.array(MeasurementSchema),
  /** `null` — the profile hasn't changed (pull) / isn't being sent (push). */
  profile: ProfileSchema.nullable(),
})

/**
 * Envelope the server accepts for `POST /sync/push`. Records stay `unknown` here and are
 * validated one by one: a single invalid record is rejected alone instead of blocking
 * the whole outbox.
 */
export const SyncPushEnvelopeSchema = z
  .object({
    workouts: z.array(z.unknown()).default([]),
    exercises: z.array(z.unknown()).default([]),
    measurements: z.array(z.unknown()).default([]),
    profile: z.unknown().nullable().default(null),
  })
  .refine(
    (body) =>
      body.workouts.length +
        body.exercises.length +
        body.measurements.length +
        (body.profile === null ? 0 : 1) <=
      SYNC_BATCH_LIMIT,
    { message: `Не больше ${SYNC_BATCH_LIMIT} записей за раз` },
  )

/** A record that failed validation; the client should move it out of the outbox. */
export const SyncRejectionSchema = z.object({
  entity: SyncEntitySchema,
  /** `null` when the record is so broken that it has no readable id. */
  id: z.string().nullable(),
  issues: z.array(z.string()),
})

export const SyncPushResponseSchema = z.object({
  /** Written to the server. */
  applied: z.number().int(),
  /** Ignored: the server already has the same or a newer version (last write wins). */
  skipped: z.number().int(),
  rejected: z.array(SyncRejectionSchema),
})

export const SyncPullQuerySchema = z.object({
  /** Server revision the client has already seen; 0 — pull everything. */
  cursor: z.coerce.number().int().min(0).default(0),
})

export const SyncPullResponseSchema = z.object({
  changes: SyncChangesSchema,
  /** Pass as `cursor` in the next pull. */
  cursor: z.number().int(),
  /** More changes are waiting: pull again right away with the new cursor. */
  hasMore: z.boolean(),
})

export type SyncEntity = z.infer<typeof SyncEntitySchema>
export type SyncChanges = z.infer<typeof SyncChangesSchema>
/** What the client sends: the same shape as pulled changes, collections may be omitted. */
export type SyncPushRequest = Partial<SyncChanges>
export type SyncRejection = z.infer<typeof SyncRejectionSchema>
export type SyncPushResponse = z.infer<typeof SyncPushResponseSchema>
export type SyncPullQuery = z.infer<typeof SyncPullQuerySchema>
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>

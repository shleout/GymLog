import type { SyncEntity, SyncPushRequest } from '@gymlog/schemas'
import type { Exercise } from '@/entities/exercise'
import type { Measurement } from '@/entities/measurement'
import type { Profile } from '@/entities/profile'
import type { SyncState } from '@/entities/sync'
import type { Workout } from '@/entities/workout'

export const PROFILE_KEY = 'profile'

export const recordKey = (entity: SyncEntity, id: string | null): string =>
  entity === 'profile' ? PROFILE_KEY : `${entity}:${id}`

/** Local data the outbox is derived from. */
export type LocalData = {
  workouts: Workout[]
  exercises: Exercise[]
  measurements: Measurement[]
  profile: Profile
}

type SyncMarks = Pick<SyncState, 'synced' | 'rejected'>

/** Changed since the server last saw it, and not this exact version rejected before. */
const isPending = (marks: SyncMarks, key: string, updatedAt: string): boolean =>
  marks.synced[key] !== updatedAt && marks.rejected[key]?.updatedAt !== updatedAt

export type PendingBatch = {
  body: SyncPushRequest
  /** Key → `updatedAt` of every record in `body`: what to mark as synced after the push. */
  versions: Record<string, string>
}

/** Pending records, at most `limit` of them (the server's batch limit counts the profile too). */
export const collectPending = (data: LocalData, marks: SyncMarks, limit: number): PendingBatch => {
  const versions: Record<string, string> = {}
  let left = limit

  const pick = <T extends { id: string; updatedAt: string }>(entity: SyncEntity, records: T[]): T[] => {
    const picked: T[] = []
    for (const record of records) {
      if (left === 0) break
      const key = recordKey(entity, record.id)
      if (!isPending(marks, key, record.updatedAt)) continue
      picked.push(record)
      versions[key] = record.updatedAt
      left--
    }
    return picked
  }

  // Exercises first: workouts reference them by id.
  const exercises = pick('exercise', data.exercises)
  const workouts = pick('workout', data.workouts)
  const measurements = pick('measurement', data.measurements)

  // `updatedAt: null` — never edited, nothing to send.
  const { profile } = data
  const profileVersion = profile.updatedAt
  const sendProfile =
    left > 0 && profileVersion !== null && isPending(marks, PROFILE_KEY, profileVersion)
  if (sendProfile) versions[PROFILE_KEY] = profileVersion

  return {
    body: { exercises, workouts, measurements, profile: sendProfile ? profile : null },
    versions,
  }
}

export const countPending = (data: LocalData, marks: SyncMarks): number =>
  Object.keys(collectPending(data, marks, Number.POSITIVE_INFINITY).versions).length

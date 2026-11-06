import { z } from 'zod'
import { nowIso } from '@/shared/lib'

/** Current version of the persisted exercise state. Bump it together with a new migration step. */
export const EXERCISE_STATE_VERSION = 3

// Shapes of old versions are described loosely: only the fields a step needs.
const V0StateSchema = z.object({
  exercises: z.array(z.looseObject({})),
})

/** v0 → v1: sync fields. Exercises had no dates, so the migration time is used. */
const v0ToV1 = (state: unknown): unknown => {
  const result = V0StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  const now = nowIso()
  return {
    exercises: result.data.exercises.map((exercise) => ({
      ...exercise,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })),
  }
}

/** v1 → v2: exercise kind (dropped again in v3, kept so that old data goes through every step). */
const v1ToV2 = (state: unknown): unknown => {
  const result = V0StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  return {
    exercises: result.data.exercises.map((exercise) => ({ kind: 'reps', ...exercise })),
  }
}

/**
 * v2 → v3: the kind is gone. Whether a set counts reps or time is decided by the set itself
 * (and by the workout entry in the form), so one exercise can have both.
 */
const v2ToV3 = (state: unknown): unknown => {
  const result = V0StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  return {
    exercises: result.data.exercises.map(({ kind: _kind, ...exercise }) => exercise),
  }
}

/** Upgrades persisted state step by step from `version` to `EXERCISE_STATE_VERSION`. */
export const migrateExerciseState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 1) state = v0ToV1(state)
  if (version < 2) state = v1ToV2(state)
  if (version < 3) state = v2ToV3(state)
  return state
}

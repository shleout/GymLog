import { z } from 'zod'
import { nowIso } from '@/shared/lib'

/** Current version of the persisted exercise state. Bump it together with a new migration step. */
export const EXERCISE_STATE_VERSION = 1

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

/** Upgrades persisted state step by step from `version` to `EXERCISE_STATE_VERSION`. */
export const migrateExerciseState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 1) state = v0ToV1(state)
  return state
}

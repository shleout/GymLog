import { z } from 'zod'

/** Current version of the persisted workout state. Bump it together with a new migration step. */
export const WORKOUT_STATE_VERSION = 2

// Shapes of old versions are described loosely: only the fields a step needs.
const V0StateSchema = z.object({
  workouts: z.array(z.looseObject({ date: z.string() })),
})

/** v0 → v1: sync fields. Old records get their workout date as creation time. */
const v0ToV1 = (state: unknown): unknown => {
  const result = V0StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  return {
    workouts: result.data.workouts.map((workout) => ({
      ...workout,
      createdAt: workout.date,
      updatedAt: workout.date,
      deletedAt: null,
    })),
  }
}

/** Upgrades persisted state step by step from `version` to `WORKOUT_STATE_VERSION`. */
export const migrateWorkoutState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 1) state = v0ToV1(state)
  // v1 → v2: optional notes (workout, entry) and set RIR. Old records are valid as is.
  return state
}

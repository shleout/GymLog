import { z } from 'zod'

/** Current version of the persisted measurement state. Bump it together with a new migration step. */
export const MEASUREMENT_STATE_VERSION = 1

// Shapes of old versions are described loosely: only the fields a step needs.
const V0StateSchema = z.object({
  measurements: z.array(z.looseObject({ date: z.string() })),
})

/** v0 → v1: sync fields. Old records get their session date as creation time. */
const v0ToV1 = (state: unknown): unknown => {
  const result = V0StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  return {
    measurements: result.data.measurements.map((measurement) => ({
      ...measurement,
      createdAt: measurement.date,
      updatedAt: measurement.date,
      deletedAt: null,
    })),
  }
}

/** Upgrades persisted state step by step from `version` to `MEASUREMENT_STATE_VERSION`. */
export const migrateMeasurementState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 1) state = v0ToV1(state)
  return state
}

import { normalizeName } from '@/shared/lib'
import type { Measurement } from '../model/types'
import type { MeasuredValue } from './getLatestMeasurements'
import { sortMeasurementsDesc } from './sortMeasurementsDesc'

export type PreviousValues = {
  weight?: MeasuredValue
  /** Keyed by `normalizeName(part name)`. */
  parts: Map<string, MeasuredValue>
}

/** For each value of `session`, the closest earlier value of the same metric (same order as the history list). */
export const getPreviousValues = (measurements: Measurement[], session: Measurement): PreviousValues => {
  const sorted = sortMeasurementsDesc(measurements)
  const earlier = sorted.slice(sorted.findIndex((item) => item.id === session.id) + 1)

  const weightSession = earlier.find((item) => item.weight !== undefined)
  const parts = new Map<string, MeasuredValue>()
  for (const { name } of session.values) {
    const key = normalizeName(name)
    for (const item of earlier) {
      const match = item.values.find((value) => normalizeName(value.name) === key)
      if (match) {
        parts.set(key, { value: match.value, date: item.date })
        break
      }
    }
  }

  return {
    weight:
      weightSession?.weight !== undefined
        ? { value: weightSession.weight, date: weightSession.date }
        : undefined,
    parts,
  }
}

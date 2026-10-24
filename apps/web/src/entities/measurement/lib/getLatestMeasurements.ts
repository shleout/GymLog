import { cleanName, normalizeName } from '@/shared/lib'
import type { Measurement } from '../model/types'
import { sortMeasurementsDesc } from './sortMeasurementsDesc'

export type MeasuredValue = {
  value: number
  /** ISO date of the session. */
  date: string
}

export type LatestValue = MeasuredValue & {
  previous?: MeasuredValue
}

export type LatestPart = LatestValue & {
  /** Spelling from the most recent session. */
  name: string
  key: string
}

export type LatestMeasurements = {
  weight?: LatestValue
  /** Every body part ever measured, most recently measured first. */
  parts: LatestPart[]
}

const withPrevious = (
  latest: LatestValue | undefined,
  value: MeasuredValue,
): LatestValue => (latest ? { ...latest, previous: latest.previous ?? value } : value)

/** Latest and previous value of body weight and of each body part. */
export const getLatestMeasurements = (measurements: Measurement[]): LatestMeasurements => {
  const sorted = sortMeasurementsDesc(measurements)

  let weight: LatestValue | undefined
  const parts = new Map<string, LatestPart>()

  for (const session of sorted) {
    if (session.weight !== undefined && !weight?.previous) {
      weight = withPrevious(weight, { value: session.weight, date: session.date })
    }
    for (const { name, value } of session.values) {
      const key = normalizeName(name)
      const current = parts.get(key)
      if (current?.previous) continue
      const next = withPrevious(current, { value, date: session.date })
      parts.set(key, { ...next, key, name: current?.name ?? cleanName(name) })
    }
  }

  return { weight, parts: [...parts.values()] }
}

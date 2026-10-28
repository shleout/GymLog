import { cleanName, normalizeName } from '@/shared/lib'
import type { Measurement } from '../model/types'
import { sortMeasurementsDesc } from './sortMeasurementsDesc'

export type TrackPoint = {
  measurementId: string
  /** ISO date of the session. */
  date: string
  value: number
}

/** Body weight or one body part across all sessions. */
export type MeasurementTrack = {
  /** `weight` or `part:<normalized name>`. */
  id: string
  /** Spelling from the most recent session. */
  name: string
  unit: 'кг' | 'см'
  /** Oldest first, as a chart draws them. */
  points: TrackPoint[]
}

/** Body weight first, then body parts, most recently measured first (as in getLatestMeasurements). */
export const getMeasurementTracks = (measurements: Measurement[]): MeasurementTrack[] => {
  const weight: MeasurementTrack = { id: 'weight', name: 'Вес тела', unit: 'кг', points: [] }
  const parts = new Map<string, MeasurementTrack>()

  for (const session of sortMeasurementsDesc(measurements)) {
    const point = { measurementId: session.id, date: session.date }
    if (session.weight !== undefined) weight.points.push({ ...point, value: session.weight })
    for (const { name, value } of session.values) {
      const id = `part:${normalizeName(name)}`
      const track = parts.get(id) ?? { id, name: cleanName(name), unit: 'см', points: [] }
      track.points.push({ ...point, value })
      parts.set(id, track)
    }
  }

  return [weight, ...parts.values()]
    .filter((track) => track.points.length > 0)
    .map((track) => ({ ...track, points: track.points.reverse() }))
}

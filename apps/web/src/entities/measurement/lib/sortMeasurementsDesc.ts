import { parseISO } from 'date-fns'
import type { Measurement } from '../model/types'

/**
 * Newest first. The form stores only the day, so sessions on the same day are
 * ordered by `createdAt`, then by position in the store (records migrated from v0
 * share `createdAt` with their date; the store appends, so a later index is newer).
 */
export const sortMeasurementsDesc = (measurements: Measurement[]): Measurement[] =>
  measurements
    .map((measurement, index) => ({
      measurement,
      index,
      time: parseISO(measurement.date).getTime(),
      createdAt: parseISO(measurement.createdAt).getTime(),
    }))
    .sort((a, b) => b.time - a.time || b.createdAt - a.createdAt || b.index - a.index)
    .map(({ measurement }) => measurement)

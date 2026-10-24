import { parseISO } from 'date-fns'
import type { Measurement } from '../model/types'

/**
 * Newest first. The form stores only the day, so sessions on the same day are
 * ordered by entry: the store appends, so a later index means a newer session.
 */
export const sortMeasurementsDesc = (measurements: Measurement[]): Measurement[] =>
  measurements
    .map((measurement, index) => ({ measurement, index, time: parseISO(measurement.date).getTime() }))
    .sort((a, b) => b.time - a.time || b.index - a.index)
    .map(({ measurement }) => measurement)

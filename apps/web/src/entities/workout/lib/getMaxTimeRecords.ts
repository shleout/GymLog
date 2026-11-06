import type { ExerciseSession } from './getExerciseSessions'
import { getUnweightedRecords } from './recordsByMetric'

export type MaxTimeRecord = {
  durationSec: number
  workoutId: string
  date: string
}

/** Records of hold time without weight, newest (current) first. */
export const getMaxTimeRecords = (sessions: ExerciseSession[]): MaxTimeRecord[] =>
  getUnweightedRecords(sessions, 'durationSec').map(({ value, ...rest }) => ({
    durationSec: value,
    ...rest,
  }))

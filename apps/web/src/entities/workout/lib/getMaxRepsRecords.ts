import type { ExerciseSession } from './getExerciseSessions'
import { getUnweightedRecords } from './recordsByMetric'

export type MaxRepsRecord = {
  reps: number
  workoutId: string
  date: string
}

/**
 * Records of reps in one set without weight, newest (current) first: every time
 * the previous best was beaten. Weighted sets don't count — they are not comparable.
 */
export const getMaxRepsRecords = (sessions: ExerciseSession[]): MaxRepsRecord[] =>
  getUnweightedRecords(sessions, 'reps').map(({ value, ...rest }) => ({ reps: value, ...rest }))

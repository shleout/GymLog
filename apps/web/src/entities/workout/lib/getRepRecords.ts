import type { ExerciseSession } from './getExerciseSessions'
import { getWeightedRecords } from './recordsByMetric'

export type RepRecord = {
  reps: number
  /** kg */
  weight: number
  /** The first workout where this record was set. */
  workoutId: string
  date: string
}

/**
 * Records that no other set beats in both weight and reps, sorted by reps ascending
 * (so weight goes down). A set like 18×8 is dropped when there is 20×10: the latter
 * is heavier and longer at once.
 */
export const getRepRecords = (sessions: ExerciseSession[]): RepRecord[] =>
  getWeightedRecords(sessions, 'reps').map(({ value, ...rest }) => ({ reps: value, ...rest }))

/** The heaviest set with at least `reps` reps: if you did 20×10, you can do 20×8 as well. */
export const getRepRecord = (sessions: ExerciseSession[], reps: number): RepRecord | undefined =>
  getRepRecords(sessions).find((record) => record.reps >= reps)

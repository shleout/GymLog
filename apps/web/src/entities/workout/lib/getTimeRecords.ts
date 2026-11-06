import type { ExerciseSession } from './getExerciseSessions'
import { getWeightedRecords } from './recordsByMetric'

export type TimeRecord = {
  durationSec: number
  /** kg */
  weight: number
  /** The first workout where this record was set. */
  workoutId: string
  date: string
}

/** Holds with weight that no other hold beats in both weight and time, shortest first. */
export const getTimeRecords = (sessions: ExerciseSession[]): TimeRecord[] =>
  getWeightedRecords(sessions, 'durationSec').map(({ value, ...rest }) => ({
    durationSec: value,
    ...rest,
  }))

/** The heaviest hold of at least `durationSec`: 15 kg for 30 s also covers 15 kg for 20 s. */
export const getTimeRecord = (
  sessions: ExerciseSession[],
  durationSec: number,
): TimeRecord | undefined =>
  getTimeRecords(sessions).find((record) => record.durationSec >= durationSec)

import type { ExerciseSession } from './getExerciseSessions'

export type MaxRepsRecord = {
  reps: number
  workoutId: string
  date: string
}

/**
 * Records of reps in one set without weight, newest (current) first: every time
 * the previous best was beaten. Weighted sets don't count — they are not comparable.
 */
export const getMaxRepsRecords = (sessions: ExerciseSession[]): MaxRepsRecord[] => {
  const records: MaxRepsRecord[] = []
  let best = 0
  for (const session of [...sessions].reverse()) {
    for (const set of session.sets) {
      if (set.weight !== undefined || set.reps <= best) continue
      best = set.reps
      // Several records within one workout: keep only its best.
      if (records.at(-1)?.workoutId === session.workoutId) records.pop()
      records.push({ reps: set.reps, workoutId: session.workoutId, date: session.date })
    }
  }
  return records.reverse()
}

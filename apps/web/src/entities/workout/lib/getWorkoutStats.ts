import type { Workout } from '../model/types'

export type WorkoutStats = {
  exercisesCount: number
  setsCount: number
  repsCount: number
  /** Total time under load of timed sets, seconds. */
  holdSeconds: number
  /** Sum of weight × reps over sets with weight, kg. */
  volume: number
}

export const getWorkoutStats = (workout: Workout): WorkoutStats => {
  let setsCount = 0
  let repsCount = 0
  let holdSeconds = 0
  let volume = 0
  for (const entry of workout.entries) {
    for (const set of entry.sets) {
      setsCount += 1
      repsCount += set.reps ?? 0
      holdSeconds += set.durationSec ?? 0
      volume += (set.weight ?? 0) * (set.reps ?? 0)
    }
  }
  return { exercisesCount: workout.entries.length, setsCount, repsCount, holdSeconds, volume }
}

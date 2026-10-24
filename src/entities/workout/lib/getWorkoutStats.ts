import type { Workout } from '../model/types'

export type WorkoutStats = {
  exercisesCount: number
  setsCount: number
  repsCount: number
  /** Sum of weight × reps over sets with weight, kg. */
  volume: number
}

export const getWorkoutStats = (workout: Workout): WorkoutStats => {
  let setsCount = 0
  let repsCount = 0
  let volume = 0
  for (const entry of workout.entries) {
    for (const set of entry.sets) {
      setsCount += 1
      repsCount += set.reps
      volume += (set.weight ?? 0) * set.reps
    }
  }
  return { exercisesCount: workout.entries.length, setsCount, repsCount, volume }
}

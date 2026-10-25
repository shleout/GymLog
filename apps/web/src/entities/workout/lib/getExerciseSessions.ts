import type { Set, Workout } from '../model/types'
import { sortWorkoutsDesc } from './sortWorkoutsDesc'

/** One exercise within one workout. */
export type ExerciseSession = {
  workoutId: string
  date: string
  /** All sets of the exercise in this workout, even if it was entered as several entries. */
  sets: Set[]
}

/** Workouts with this exercise, newest first. Pass active workouts (useWorkouts). */
export const getExerciseSessions = (workouts: Workout[], exerciseId: string): ExerciseSession[] =>
  sortWorkoutsDesc(workouts).flatMap((workout) => {
    const sets = workout.entries
      .filter((entry) => entry.exerciseId === exerciseId)
      .flatMap((entry) => entry.sets)
    return sets.length > 0 ? [{ workoutId: workout.id, date: workout.date, sets }] : []
  })

import type { Set, Workout } from '../model/types'
import { sortWorkoutsDesc } from './sortWorkoutsDesc'

/** One exercise within one workout. */
export type ExerciseSession = {
  workoutId: string
  date: string
  /** All sets of the exercise in this workout, even if it was entered as several entries. */
  sets: Set[]
  /** Notes of those entries, in order. */
  notes: string[]
}

/** Workouts with this exercise, newest first. Pass active workouts (useWorkouts). */
export const getExerciseSessions = (workouts: Workout[], exerciseId: string): ExerciseSession[] =>
  sortWorkoutsDesc(workouts).flatMap((workout) => {
    const entries = workout.entries.filter((entry) => entry.exerciseId === exerciseId)
    const sets = entries.flatMap((entry) => entry.sets)
    const notes = entries.flatMap((entry) => (entry.note ? [entry.note] : []))
    return sets.length > 0 ? [{ workoutId: workout.id, date: workout.date, sets, notes }] : []
  })

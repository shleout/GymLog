import { parseISO } from 'date-fns'
import type { Workout } from '../model/types'

/**
 * Newest first. The form stores only the day, so workouts on the same day are
 * ordered by entry: the store appends, so a later index means a newer workout.
 */
export const sortWorkoutsDesc = (workouts: Workout[]): Workout[] =>
  workouts
    .map((workout, index) => ({ workout, index, time: parseISO(workout.date).getTime() }))
    .sort((a, b) => b.time - a.time || b.index - a.index)
    .map(({ workout }) => workout)

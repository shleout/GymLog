import { parseISO } from 'date-fns'
import type { Workout } from '../model/types'

/**
 * Newest first. The form stores only the day, so workouts on the same day are
 * ordered by `createdAt`, then by position in the store (records migrated from v0
 * share `createdAt` with their date; the store appends, so a later index is newer).
 */
export const sortWorkoutsDesc = (workouts: Workout[]): Workout[] =>
  workouts
    .map((workout, index) => ({
      workout,
      index,
      time: parseISO(workout.date).getTime(),
      createdAt: parseISO(workout.createdAt).getTime(),
    }))
    .sort((a, b) => b.time - a.time || b.createdAt - a.createdAt || b.index - a.index)
    .map(({ workout }) => workout)

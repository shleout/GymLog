import { parseISO, subMonths } from 'date-fns'
import type { ProgressPoint } from './getExerciseProgress'

const getMaxValue = (points: ProgressPoint[]): number | undefined =>
  points.length === 0 ? undefined : Math.max(...points.map((point) => point.value))

/**
 * Best value of the last `months` against the best before them (kg of 1RM or reps).
 * `undefined` when one of the periods has no workouts — there is nothing to compare.
 */
export const getRecentChange = (
  points: ProgressPoint[],
  months: number,
  now: number,
): number | undefined => {
  const since = subMonths(now, months).getTime()
  const recent = getMaxValue(points.filter((point) => parseISO(point.date).getTime() >= since))
  const before = getMaxValue(points.filter((point) => parseISO(point.date).getTime() < since))
  return recent !== undefined && before !== undefined ? recent - before : undefined
}

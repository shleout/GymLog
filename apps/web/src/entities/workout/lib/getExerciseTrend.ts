import { parseISO, subMonths } from 'date-fns'
import type { ProgressPoint } from './getExerciseProgress'

/**
 * - `up` — the best result grew against the baseline;
 * - `stalled` — no growth and the last `STALL_SESSIONS` workouts did not beat the earlier best;
 * - `down` — the best of the period is below the baseline;
 * - `flat` — the same as the baseline, not yet a stall;
 * - `new` — nothing to compare with (no earlier workouts, or a single one for «all time»);
 * - `idle` — the exercise was not done in the period.
 */
export type TrendStatus = 'up' | 'stalled' | 'down' | 'flat' | 'new' | 'idle'

export type ExerciseTrend = {
  status: TrendStatus
  /** Baseline value (best before the period; the first workout for «all time»). */
  before?: number
  /** Best value of the period (of all workouts for «all time»). */
  current?: number
  /** `current - before`, rounded to 0.1. */
  change?: number
  /** `change` relative to `before`, %. */
  percent?: number
}

/** Workouts in a row without a new best after which the exercise counts as stalled. */
export const STALL_SESSIONS = 4

const getMax = (points: ProgressPoint[]): number => Math.max(...points.map((point) => point.value))

/** The last `STALL_SESSIONS` workouts did not beat the best of the earlier ones. */
const isStalled = (points: ProgressPoint[]): boolean => {
  if (points.length <= STALL_SESSIONS) return false
  const earlier = points.slice(0, -STALL_SESSIONS)
  const recent = points.slice(-STALL_SESSIONS)
  return getMax(recent) <= getMax(earlier)
}

const compare = (before: number, current: number, stalled: boolean): ExerciseTrend => {
  const change = Math.round((current - before) * 10) / 10
  const status: TrendStatus = change > 0 ? 'up' : stalled ? 'stalled' : change < 0 ? 'down' : 'flat'
  return { status, before, current, change, percent: before > 0 ? (change / before) * 100 : undefined }
}

/**
 * Trend of one exercise over `months` (`undefined` — all time). Points are the best set of each
 * workout, oldest first (`getExerciseProgress`), of one mode: reps and holds are not comparable.
 * The stall ignores the period: it is about the last workouts, not about a calendar window.
 */
export const getExerciseTrend = (
  points: ProgressPoint[],
  months: number | undefined,
  now: number,
): ExerciseTrend => {
  if (points.length === 0) return { status: 'idle' }
  const stalled = isStalled(points)

  if (months === undefined) {
    if (points.length < 2) return { status: 'new', current: points[0].value }
    return compare(points[0].value, getMax(points), stalled)
  }

  const since = subMonths(now, months).getTime()
  const recent = points.filter((point) => parseISO(point.date).getTime() >= since)
  const earlier = points.filter((point) => parseISO(point.date).getTime() < since)
  if (recent.length === 0) return { status: 'idle' }
  if (earlier.length === 0) return { status: 'new', current: getMax(recent) }
  return compare(getMax(earlier), getMax(recent), stalled)
}

import type { Set } from '../model/types'
import { getBestSet } from './getBestSet'
import type { ExerciseSession } from './getExerciseSessions'

export type ProgressPoint = {
  workoutId: string
  date: string
  /** Estimated 1RM (kg) for `weight` progress, reps for `reps`, seconds for `time`. */
  value: number
  set: Set
}

export type ExerciseProgress = {
  /**
   * `time` for holds; otherwise `weight` if the exercise was ever done with weight, and
   * `reps` if not (bodyweight).
   */
  kind: 'weight' | 'reps' | 'time'
  /** Best set of each workout, oldest first. */
  points: ProgressPoint[]
  /** The heaviest single (exactly 1 rep) of each workout that had one, oldest first. */
  singles: ProgressPoint[]
  /** Number of single sets over all workouts. */
  singleCount: number
}

/** Progress over the sessions returned by `getExerciseSessions`. */
export const getExerciseProgress = (sessions: ExerciseSession[]): ExerciseProgress => {
  const weighted = sessions.some((session) => session.sets.some((set) => set.weight !== undefined))
  const timed = sessions.some((session) => session.sets.some((set) => set.durationSec !== undefined))
  const points: ProgressPoint[] = []
  const singles: ProgressPoint[] = []
  let singleCount = 0

  for (const session of [...sessions].reverse()) {
    // Bodyweight-only sessions of a weighted exercise are not comparable with the rest.
    const sets = weighted ? session.sets.filter((set) => set.weight !== undefined) : session.sets
    const best = getBestSet(sets)
    if (best) points.push({ workoutId: session.workoutId, date: session.date, ...best })

    let heaviestSingle: Set | undefined
    for (const set of sets) {
      if (set.weight === undefined || set.reps !== 1) continue
      singleCount += 1
      if (!heaviestSingle || set.weight > (heaviestSingle.weight ?? 0)) heaviestSingle = set
    }
    if (heaviestSingle?.weight !== undefined) {
      singles.push({
        workoutId: session.workoutId,
        date: session.date,
        value: heaviestSingle.weight,
        set: heaviestSingle,
      })
    }
  }

  const kind = timed ? 'time' : weighted ? 'weight' : 'reps'
  return { kind, points, singles, singleCount }
}

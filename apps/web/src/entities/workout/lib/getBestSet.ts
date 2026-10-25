import type { Set } from '../model/types'
import { estimateOneRepMax } from './estimateOneRepMax'

export type BestSet = {
  set: Set
  /** Estimated 1RM, kg — for a weighted set; reps — for a bodyweight one. */
  value: number
}

/**
 * The best set by estimated 1RM among sets with weight. Without weighted sets
 * (a bodyweight exercise) — the set with the most reps.
 */
export const getBestSet = (sets: Set[]): BestSet | undefined => {
  let best: BestSet | undefined
  const weighted = sets.some((set) => set.weight !== undefined)

  for (const set of sets) {
    if (weighted && set.weight === undefined) continue
    const value = set.weight === undefined ? set.reps : estimateOneRepMax(set.weight, set.reps)
    if (!best || value > best.value) best = { set, value }
  }
  return best
}

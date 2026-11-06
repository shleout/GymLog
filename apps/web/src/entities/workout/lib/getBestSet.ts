import type { Set } from '../model/types'
import { estimateOneRepMax } from './estimateOneRepMax'

export type BestSet = {
  set: Set
  /**
   * Estimated 1RM, kg — for a weighted set; reps — for a bodyweight one; seconds — for a
   * timed one (there is no formula to compare a longer hold with a heavier one).
   */
  value: number
}

const getSetValue = (set: Set): number | undefined => {
  if (set.durationSec !== undefined) return set.durationSec
  if (set.reps === undefined) return undefined
  return set.weight === undefined ? set.reps : estimateOneRepMax(set.weight, set.reps)
}

/**
 * The best set by estimated 1RM among sets with weight. Without weighted sets
 * (a bodyweight exercise) — the set with the most reps. For holds — the longest one.
 */
export const getBestSet = (sets: Set[]): BestSet | undefined => {
  let best: BestSet | undefined
  const weighted = sets.some((set) => set.weight !== undefined)

  for (const set of sets) {
    if (weighted && set.weight === undefined) continue
    const value = getSetValue(set)
    if (value === undefined) continue
    if (!best || value > best.value) best = { set, value }
  }
  return best
}

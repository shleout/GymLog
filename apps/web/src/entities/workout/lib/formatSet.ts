import { formatDuration, formatNumber } from '@/shared/lib'
import type { Set } from '../model/types'

/**
 * `85×5`, or `×12` for a set without weight. A timed set: `15 кг · 0:30`, or just `0:30`
 * without weight.
 */
export const formatSet = ({
  weight,
  reps,
  durationSec,
}: Pick<Set, 'weight' | 'reps' | 'durationSec'>): string => {
  if (durationSec !== undefined) {
    return weight === undefined
      ? formatDuration(durationSec)
      : `${formatNumber(weight)} кг · ${formatDuration(durationSec)}`
  }
  return weight === undefined ? `×${reps}` : `${formatNumber(weight)}×${reps}`
}

/** `85×5 RIR 2`: for lists of the user's sets, where the effort matters. */
export const formatSetWithRir = (set: Pick<Set, 'weight' | 'reps' | 'durationSec' | 'rir'>): string =>
  set.rir === undefined ? formatSet(set) : `${formatSet(set)} RIR ${set.rir}`

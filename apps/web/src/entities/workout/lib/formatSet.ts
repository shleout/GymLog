import { formatNumber } from '@/shared/lib'
import type { Set } from '../model/types'

/** `85×5`, or `×12` for a set without weight. */
export const formatSet = ({ weight, reps }: Pick<Set, 'weight' | 'reps'>): string =>
  weight === undefined ? `×${reps}` : `${formatNumber(weight)}×${reps}`

/** `85×5 RIR 2`: for lists of the user's sets, where the effort matters. */
export const formatSetWithRir = (set: Pick<Set, 'weight' | 'reps' | 'rir'>): string =>
  set.rir === undefined ? formatSet(set) : `${formatSet(set)} RIR ${set.rir}`

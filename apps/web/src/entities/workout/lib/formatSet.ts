import { formatNumber } from '@/shared/lib'
import type { Set } from '../model/types'

/** `85×5`, or `×12` for a set without weight. */
export const formatSet = ({ weight, reps }: Pick<Set, 'weight' | 'reps'>): string =>
  weight === undefined ? `×${reps}` : `${formatNumber(weight)}×${reps}`

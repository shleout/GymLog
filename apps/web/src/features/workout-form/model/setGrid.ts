import type { ExerciseKind } from '@/entities/exercise'

/** Columns: #, weight, reps, RIR, remove. Shared with the header row in ExerciseEntryCard. */
export const REPS_SET_GRID = 'grid-cols-[2rem_1fr_1fr_3rem_2.75rem]'
/** A timed set has minutes and seconds instead of reps: #, weight, min, sec, RIR, remove. */
export const TIME_SET_GRID = 'grid-cols-[2rem_1fr_3.5rem_3.5rem_3rem_2.75rem]'

/** Grid of a set row; shared with the header row in ExerciseEntryCard. */
export const getSetGrid = (kind: ExerciseKind): string =>
  kind === 'time' ? TIME_SET_GRID : REPS_SET_GRID

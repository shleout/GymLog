import type { z } from 'zod'
import type { SyncMeta } from '@/shared/lib'
import type { SetSchema, WorkoutEntrySchema, WorkoutSchema, WorkoutStateSchema } from './schemas'

export type Set = z.infer<typeof SetSchema>
export type WorkoutEntry = z.infer<typeof WorkoutEntrySchema>
export type Workout = z.infer<typeof WorkoutSchema>
export type WorkoutState = z.infer<typeof WorkoutStateSchema>
/** Workout data as features create it; sync fields are set by the store. */
export type WorkoutInput = Omit<Workout, keyof SyncMeta>

import type { z } from 'zod'
import type { SetSchema, WorkoutEntrySchema, WorkoutSchema, WorkoutStateSchema } from './schemas'

export type Set = z.infer<typeof SetSchema>
export type WorkoutEntry = z.infer<typeof WorkoutEntrySchema>
export type Workout = z.infer<typeof WorkoutSchema>
export type WorkoutState = z.infer<typeof WorkoutStateSchema>

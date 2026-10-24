import type { z } from 'zod'
import type { ExerciseSchema, ExerciseStateSchema } from './schemas'

export type Exercise = z.infer<typeof ExerciseSchema>
export type ExerciseState = z.infer<typeof ExerciseStateSchema>

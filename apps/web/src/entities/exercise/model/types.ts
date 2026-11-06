import type { z } from 'zod'
import type { ExerciseKindSchema, ExerciseSchema, ExerciseStateSchema } from './schemas'

export type ExerciseKind = z.infer<typeof ExerciseKindSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type ExerciseState = z.infer<typeof ExerciseStateSchema>

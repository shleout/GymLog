import { EXERCISE_KINDS, ExerciseKindSchema, ExerciseSchema } from '@gymlog/schemas'
import { z } from 'zod'

// Record schemas are shared with the API (packages/schemas); the persisted state shape is local.
export { EXERCISE_KINDS, ExerciseKindSchema, ExerciseSchema }

export const ExerciseStateSchema = z.object({
  exercises: z.array(ExerciseSchema),
})

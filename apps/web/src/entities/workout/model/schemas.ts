import { SetSchema, WorkoutEntrySchema, WorkoutSchema } from '@gymlog/schemas'
import { z } from 'zod'

// Record schemas are shared with the API (packages/schemas); the persisted state shape is local.
export { SetSchema, WorkoutEntrySchema, WorkoutSchema }

export const WorkoutStateSchema = z.object({
  workouts: z.array(WorkoutSchema),
})

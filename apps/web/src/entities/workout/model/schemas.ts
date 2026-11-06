import {
  DurationSecSchema,
  NOTE_MAX_LENGTH,
  RepsSchema,
  RIR_MAX,
  SetSchema,
  WorkoutEntrySchema,
  WorkoutSchema,
} from '@gymlog/schemas'
import { z } from 'zod'

// Record schemas are shared with the API (packages/schemas); the persisted state shape is local.
export {
  DurationSecSchema,
  NOTE_MAX_LENGTH,
  RepsSchema,
  RIR_MAX,
  SetSchema,
  WorkoutEntrySchema,
  WorkoutSchema,
}

export const WorkoutStateSchema = z.object({
  workouts: z.array(WorkoutSchema),
})

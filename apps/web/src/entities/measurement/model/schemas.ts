import { MeasurementSchema, MeasurementValueSchema } from '@gymlog/schemas'
import { z } from 'zod'

// Record schemas are shared with the API (packages/schemas); the persisted state shape is local.
export { MeasurementSchema, MeasurementValueSchema }

export const MeasurementStateSchema = z.object({
  measurements: z.array(MeasurementSchema),
})

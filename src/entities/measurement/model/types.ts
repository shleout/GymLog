import type { z } from 'zod'
import type { MeasurementSchema, MeasurementStateSchema, MeasurementValueSchema } from './schemas'

export type MeasurementValue = z.infer<typeof MeasurementValueSchema>
export type Measurement = z.infer<typeof MeasurementSchema>
export type MeasurementState = z.infer<typeof MeasurementStateSchema>

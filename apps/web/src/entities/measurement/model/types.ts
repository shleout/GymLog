import type { z } from 'zod'
import type { SyncMeta } from '@/shared/lib'
import type { MeasurementSchema, MeasurementStateSchema, MeasurementValueSchema } from './schemas'

export type MeasurementValue = z.infer<typeof MeasurementValueSchema>
export type Measurement = z.infer<typeof MeasurementSchema>
export type MeasurementState = z.infer<typeof MeasurementStateSchema>
/** Measurement data as features create it; sync fields are set by the store. */
export type MeasurementInput = Omit<Measurement, keyof SyncMeta>

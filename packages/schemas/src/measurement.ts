import { z } from 'zod'
import { RecordDateSchema, SyncMetaSchema } from './syncMeta.js'

const step01 = (value: number) => Number.isInteger(Math.round(value * 1000) / 100)

export const MeasurementValueSchema = z.object({
  /** Body part, free text, e.g. "Талия". Matched across sessions by `normalizeName`. */
  name: z.string().trim().min(1, 'Введите название'),
  /** Circumference in cm. */
  value: z
    .number({ error: 'Введите число' })
    .positive('Больше 0')
    .max(300, 'Слишком большое значение')
    .refine(step01, { message: 'Точность — 0,1 см' }),
})

/** One measuring session: body weight and/or body part circumferences on a date. */
export const MeasurementSchema = z
  .object({
    id: z.string().min(1),
    date: RecordDateSchema,
    /** Body weight in kg. */
    weight: z
      .number({ error: 'Введите число' })
      .min(20, 'Вес от 20 кг')
      .max(400, 'Вес до 400 кг')
      .refine(step01, { message: 'Точность — 0,1 кг' })
      .optional(),
    values: z.array(MeasurementValueSchema),
  })
  .extend(SyncMetaSchema.shape)

export type MeasurementValue = z.infer<typeof MeasurementValueSchema>
export type Measurement = z.infer<typeof MeasurementSchema>

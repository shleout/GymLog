import { z } from 'zod'
import { RecordDateSchema, SyncMetaSchema } from './syncMeta.js'

export const SetSchema = z.object({
  id: z.string().min(1),
  /** Working or additional weight in kg; omitted for bodyweight sets. */
  weight: z
    .number({ error: 'Введите число' })
    .positive('Вес должен быть больше 0')
    .refine((value) => Number.isInteger(value * 2), { message: 'Шаг веса — 0,5 кг' })
    .optional(),
  reps: z
    .number({
      error: (issue) => (issue.input === undefined ? 'Укажите повторения' : 'Введите число'),
    })
    .int('Целое число')
    .positive('Больше 0'),
  completed: z.boolean(),
})

export const WorkoutEntrySchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(SetSchema),
})

export const WorkoutSchema = z
  .object({
    id: z.string().min(1),
    date: RecordDateSchema,
    entries: z.array(WorkoutEntrySchema),
  })
  .extend(SyncMetaSchema.shape)

export type Set = z.infer<typeof SetSchema>
export type WorkoutEntry = z.infer<typeof WorkoutEntrySchema>
export type Workout = z.infer<typeof WorkoutSchema>

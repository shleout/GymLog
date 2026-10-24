import { isFuture, parseISO } from 'date-fns'
import { z } from 'zod'

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

export const WorkoutSchema = z.object({
  id: z.string().min(1),
  date: z.iso
    .datetime({ offset: true, error: 'Некорректная дата' })
    .refine((value) => !isFuture(parseISO(value)), { message: 'Дата не может быть в будущем' }),
  entries: z.array(WorkoutEntrySchema),
})

export const WorkoutStateSchema = z.object({
  workouts: z.array(WorkoutSchema),
})

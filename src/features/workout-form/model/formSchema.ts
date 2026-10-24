import { isValid, parse } from 'date-fns'
import { z } from 'zod'
import { SetSchema, WorkoutSchema } from '@/entities/workout'
import { parseDecimal } from '@/shared/lib'

const DateField = z
  .string()
  .min(1, 'Укажите дату')
  .transform((value, ctx) => {
    const date = parse(value, 'yyyy-MM-dd', new Date())
    if (!isValid(date)) {
      ctx.addIssue({ code: 'custom', message: 'Некорректная дата' })
      return z.NEVER
    }
    return date.toISOString()
  })
  .pipe(WorkoutSchema.shape.date)

const SetField = z.object({
  weight: z.string().trim().transform(parseDecimal).pipe(SetSchema.shape.weight),
  reps: z.string().trim().transform(parseDecimal).pipe(SetSchema.shape.reps),
})

const EntryField = z.object({
  name: z.string().trim().min(1, 'Введите название упражнения'),
  sets: z.array(SetField).min(1, 'Добавьте хотя бы один подход'),
})

export const WorkoutFormSchema = z.object({
  date: DateField,
  entries: z.array(EntryField).min(1, 'Добавьте хотя бы одно упражнение'),
})

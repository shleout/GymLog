import { isValid, parse } from 'date-fns'
import { z } from 'zod'
import { DurationSecSchema, RepsSchema, SetSchema, WorkoutSchema } from '@/entities/workout'
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

/** Empty or whitespace-only note is no note. Workout and entry notes share the rules. */
const NoteField = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(WorkoutSchema.shape.note)

const WeightField = z.string().trim().transform(parseDecimal).pipe(SetSchema.shape.weight)
const RirField = z.string().trim().transform(parseDecimal).pipe(SetSchema.shape.rir)

const RepsSetField = z.object({
  weight: WeightField,
  reps: z.string().trim().transform(parseDecimal).pipe(RepsSchema),
  rir: RirField,
})

/**
 * Minutes and seconds are separate inputs; an empty one counts as 0, the sum must be positive.
 * Fractional seconds are rounded to whole ones.
 */
const TimeSetField = z
  .object({
    weight: WeightField,
    minutes: z.string().trim(),
    seconds: z.string().trim(),
    rir: RirField,
  })
  .transform(({ minutes, seconds, ...rest }, ctx) => {
    const m = parseDecimal(minutes) ?? 0
    const s = Math.round(parseDecimal(seconds) ?? 0)
    if (!Number.isInteger(m) || m < 0 || !Number.isInteger(s) || s < 0 || s > 59) {
      ctx.addIssue({
        code: 'custom',
        path: ['duration'],
        message: 'Минуты — целые, секунды — от 0 до 59',
      })
      return z.NEVER
    }
    const duration = DurationSecSchema.safeParse(m * 60 + s)
    if (!duration.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['duration'],
        message: m * 60 + s === 0 ? 'Укажите время' : duration.error.issues[0].message,
      })
      return z.NEVER
    }
    return { ...rest, durationSec: duration.data }
  })

const entryShape = {
  name: z.string().trim().min(1, 'Введите название упражнения'),
  note: NoteField,
}

const EntryField = z.discriminatedUnion('kind', [
  z.object({
    ...entryShape,
    kind: z.literal('reps'),
    sets: z.array(RepsSetField).min(1, 'Добавьте хотя бы один подход'),
  }),
  z.object({
    ...entryShape,
    kind: z.literal('time'),
    sets: z.array(TimeSetField).min(1, 'Добавьте хотя бы один подход'),
  }),
])

export const WorkoutFormSchema = z.object({
  date: DateField,
  entries: z.array(EntryField).min(1, 'Добавьте хотя бы одно упражнение'),
  note: NoteField,
})

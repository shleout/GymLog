import { z } from 'zod'
import { MeasurementSchema, MeasurementValueSchema } from '@/entities/measurement'
import { dateInputValueToIso, normalizeName, parseDecimal } from '@/shared/lib'

const DateField = z
  .string()
  .min(1, 'Укажите дату')
  .transform((value, ctx) => {
    const iso = dateInputValueToIso(value)
    if (iso === null) {
      ctx.addIssue({ code: 'custom', message: 'Некорректная дата' })
      return z.NEVER
    }
    return iso
  })
  .pipe(MeasurementSchema.shape.date)

const PartField = z.object({
  name: z.string(),
  value: z
    .string()
    .trim()
    .transform(parseDecimal)
    .pipe(MeasurementValueSchema.shape.value.optional()),
})

/** Empty rows are skipped: not every body part is measured every time. */
export const MeasurementFormSchema = z
  .object({
    date: DateField,
    weight: z.string().trim().transform(parseDecimal).pipe(MeasurementSchema.shape.weight),
    parts: z.array(PartField),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>()
    data.parts.forEach((part, index) => {
      const key = normalizeName(part.name)
      if (key === '') {
        if (part.value !== undefined) {
          ctx.addIssue({ code: 'custom', path: ['parts', index, 'name'], message: 'Введите название' })
        }
        return
      }
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: ['parts', index, 'name'],
          message: 'Такой замер уже есть в списке',
        })
      }
      seen.add(key)
    })

    const hasValue =
      data.weight !== undefined ||
      data.parts.some((part) => part.value !== undefined && normalizeName(part.name) !== '')
    if (!hasValue) {
      ctx.addIssue({ code: 'custom', path: ['form'], message: 'Заполните хотя бы один замер' })
    }
  })

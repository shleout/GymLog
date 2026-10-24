import { z } from 'zod'
import { TimestampSchema } from '@/shared/lib'

export const ProfileSchema = z.object({
  nickname: z.string().trim().max(30, 'Не больше 30 символов'),
  /** Height in cm. */
  height: z
    .number({ error: 'Введите число' })
    .min(50, 'Рост от 50 см')
    .max(272, 'Рост до 272 см')
    .optional(),
  /** Last edit, for last-write-wins sync; `null` until the profile is edited for the first time. */
  updatedAt: TimestampSchema.nullable(),
})

export const ProfileStateSchema = z.object({
  profile: ProfileSchema,
})

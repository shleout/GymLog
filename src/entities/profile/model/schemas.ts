import { z } from 'zod'

export const ProfileSchema = z.object({
  nickname: z.string().trim().max(30, 'Не больше 30 символов'),
  /** Height in cm. */
  height: z
    .number({ error: 'Введите число' })
    .min(50, 'Рост от 50 см')
    .max(272, 'Рост до 272 см')
    .optional(),
})

export const ProfileStateSchema = z.object({
  profile: ProfileSchema,
})

import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8
/** Upper bound keeps hashing cost bounded: argon2 work grows with input length. */
export const PASSWORD_MAX_LENGTH = 128

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Некорректный email').max(254, 'Слишком длинный email'))

export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Пароль — минимум ${PASSWORD_MIN_LENGTH} символов`)
    .max(PASSWORD_MAX_LENGTH, `Пароль — максимум ${PASSWORD_MAX_LENGTH} символов`),
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
})

/**
 * Body of register / login / refresh responses. The refresh token never appears here:
 * it travels only in an httpOnly cookie, so page scripts can't read it.
 */
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
})

export type Credentials = z.infer<typeof CredentialsSchema>
export type User = z.infer<typeof UserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>

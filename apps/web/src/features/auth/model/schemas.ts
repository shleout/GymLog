import { z } from 'zod'
import { CredentialsSchema } from '@/entities/session'

const PasswordPairSchema = CredentialsSchema.pick({ password: true }).extend({ passwordConfirm: z.string() })

/**
 * Registration form: credentials plus the repeated password. The confirmation is checked
 * only on the client — the API contract stays `Credentials`.
 */
export const RegisterFormSchema = CredentialsSchema.extend({ passwordConfirm: z.string() }).refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
    // Zod skips refinements when other fields fail; this runs the check as soon as the
    // password itself is valid, so a mismatch shows up together with an invalid email.
    when: (payload) => PasswordPairSchema.safeParse(payload.value).success,
  },
)

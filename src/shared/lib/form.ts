import type { z } from 'zod'

/** Error messages keyed by field path, e.g. `entries.0.sets.1.reps`. */
export type FormErrors = Partial<Record<string, string>>

/** Input string → number; empty string → `undefined`. Accepts both `62,5` and `62.5`. */
export const parseDecimal = (value: string): number | undefined =>
  value === '' ? undefined : Number(value.replace(',', '.'))

/** First message per field path. */
export const collectErrors = (error: z.ZodError): FormErrors => {
  const errors: FormErrors = {}
  for (const issue of error.issues) {
    const path = issue.path.map(String).join('.')
    errors[path] ??= issue.message
  }
  return errors
}

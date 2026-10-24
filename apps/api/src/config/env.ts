import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(15 * 60),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  /** `false` only for local http: browsers drop Secure cookies outside https (except localhost in some). */
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
})

export type Env = z.infer<typeof EnvSchema>

let cached: Env | undefined

/**
 * Validated environment, parsed on first use. Lazy on purpose: main.ts loads .env first,
 * and a missing variable fails the app at startup with a readable message.
 */
export const getEnv = (): Env => {
  if (!cached) {
    const result = EnvSchema.safeParse(process.env)
    if (!result.success) {
      throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`)
    }
    cached = result.data
  }
  return cached
}

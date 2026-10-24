import { CredentialsSchema, UserSchema } from '@gymlog/schemas'
import { z } from 'zod'

// Auth contracts are shared with the API (packages/schemas); the persisted state shape is local.
export { CredentialsSchema, UserSchema }

export const SessionStateSchema = z.object({
  /** Signed-in user on this device; `null` — show the login screen. */
  user: UserSchema.nullable(),
})

import type { z } from 'zod'
import type { CredentialsSchema, SessionStateSchema, UserSchema } from './schemas'

export type User = z.infer<typeof UserSchema>
export type Credentials = z.infer<typeof CredentialsSchema>
export type SessionState = z.infer<typeof SessionStateSchema>

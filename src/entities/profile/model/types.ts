import type { z } from 'zod'
import type { ProfileSchema, ProfileStateSchema } from './schemas'

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileState = z.infer<typeof ProfileStateSchema>

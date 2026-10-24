import type { z } from 'zod'
import type { ProfileSchema, ProfileStateSchema } from './schemas'

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileState = z.infer<typeof ProfileStateSchema>
/** Profile data as features edit it; `updatedAt` is set by the store. */
export type ProfileInput = Omit<Profile, 'updatedAt'>

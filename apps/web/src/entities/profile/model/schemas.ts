import { ProfileSchema } from '@gymlog/schemas'
import { z } from 'zod'

// Record schemas are shared with the API (packages/schemas); the persisted state shape is local.
export { ProfileSchema }

export const ProfileStateSchema = z.object({
  profile: ProfileSchema,
})

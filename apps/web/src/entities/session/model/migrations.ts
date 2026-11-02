import { z } from 'zod'

/** Current version of the persisted session state. Bump it together with a new migration step. */
export const SESSION_STATE_VERSION = 2

const V1StateSchema = z.object({ user: z.looseObject({}).nullable() })

/**
 * v1 → v2: user role. Saved users become `user`; an admin gets the real role from the
 * background refresh at startup (onRefreshed), so nobody is signed out by the new field.
 */
const v1ToV2 = (state: unknown): unknown => {
  const result = V1StateSchema.safeParse(state)
  if (!result.success || result.data.user === null) return state
  return { user: { role: 'user', ...result.data.user } }
}

/** Upgrades persisted state step by step from `version` to `SESSION_STATE_VERSION`. */
export const migrateSessionState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 2) state = v1ToV2(state)
  return state
}

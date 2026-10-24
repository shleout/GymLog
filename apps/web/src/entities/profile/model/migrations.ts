import { z } from 'zod'

/** Current version of the persisted profile state. Bump it together with a new migration step. */
export const PROFILE_STATE_VERSION = 1

const V0StateSchema = z.object({ profile: z.looseObject({}) })

/** v0 → v1: `updatedAt` for sync. */
const v0ToV1 = (state: unknown): unknown => {
  const result = V0StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  return { profile: { ...result.data.profile, updatedAt: null } }
}

/** Upgrades persisted state step by step from `version` to `PROFILE_STATE_VERSION`. */
export const migrateProfileState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 1) state = v0ToV1(state)
  return state
}

import { z } from 'zod'

/** Current version of the persisted sync state. Bump it together with a new migration step. */
export const SYNC_STATE_VERSION = 2

const V1StateSchema = z.looseObject({})

/** v1 → v2: `userEmail` of the account the local data belongs to (shown when another one signs in). */
const v1ToV2 = (state: unknown): unknown => {
  const result = V1StateSchema.safeParse(state)
  if (!result.success) return state // merge validates and backs up whatever is broken
  return { ...result.data, userEmail: null }
}

/** Upgrades persisted state step by step from `version` to `SYNC_STATE_VERSION`. */
export const migrateSyncState = (persisted: unknown, version: number): unknown => {
  let state = persisted
  if (version < 2) state = v1ToV2(state)
  return state
}

/** Current version of the persisted sync state. Bump it together with a new migration step. */
export const SYNC_STATE_VERSION = 1

/** Upgrades persisted state step by step from `version` to `SYNC_STATE_VERSION`. */
export const migrateSyncState = (persisted: unknown, _version: number): unknown => persisted

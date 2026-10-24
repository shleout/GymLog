/** Current version of the persisted session state. Bump it together with a new migration step. */
export const SESSION_STATE_VERSION = 1

/** Upgrades persisted state step by step from `version` to `SESSION_STATE_VERSION`. */
export const migrateSessionState = (persisted: unknown, _version: number): unknown => persisted

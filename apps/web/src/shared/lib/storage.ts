import { z } from 'zod'
import type { PersistStorage } from 'zustand/middleware'

const CORRUPTED_SUFFIX = ':corrupted'

/**
 * Reads a value from localStorage and validates it with the given schema.
 * Unparsable or invalid data is moved to a `<key>:corrupted` backup and `null` is returned,
 * so the caller falls back to its default state without losing the original data.
 */
export const loadState = <T>(key: string, schema: z.ZodType<T>): T | null => {
  let raw: string | null
  try {
    raw = localStorage.getItem(key)
  } catch (error) {
    console.warn(`[storage] Failed to read "${key}"`, error)
    return null
  }
  if (raw === null) return null

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (error) {
    console.warn(`[storage] Invalid JSON in "${key}", moved to backup`, error)
    backupCorrupted(key, raw)
    removeState(key)
    return null
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    console.warn(`[storage] Invalid data in "${key}", moved to backup`, z.prettifyError(result.error))
    backupCorrupted(key, data)
    removeState(key)
    return null
  }
  return result.data
}

export const saveState = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] Failed to save "${key}"`, error)
  }
}

export const removeState = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`[storage] Failed to remove "${key}"`, error)
  }
}

const CorruptedBackupSchema = z.array(z.object({ at: z.string(), data: z.unknown() }))

/** Appends data that failed validation to `<key>:corrupted`, so it can be recovered by hand. */
export const backupCorrupted = (key: string, data: unknown): void => {
  const backupKey = key + CORRUPTED_SUFFIX
  const existing = loadState(backupKey, CorruptedBackupSchema) ?? []
  saveState(backupKey, [...existing, { at: new Date().toISOString(), data }])
}

const PersistedEnvelopeSchema = z.object({
  state: z.unknown(),
  version: z.number().optional(),
})

/**
 * Storage for zustand `persist` that checks only the `{ state, version }` envelope.
 * The state itself is validated later, in `merge`, after `migrate` has upgraded old versions:
 * validating here would check v0 data against the v1 schema and throw it away.
 */
export const createPersistStorage = (): PersistStorage<unknown> => ({
  getItem: (name) => loadState(name, PersistedEnvelopeSchema),
  setItem: (name, value) => saveState(name, value),
  removeItem: (name) => removeState(name),
})

const RecordSchema = z.record(z.string(), z.unknown())

/** Reads a field of persisted state of unknown shape. */
export const pickPersistedField = (persisted: unknown, field: string): unknown => {
  const result = RecordSchema.safeParse(persisted)
  return result.success ? result.data[field] : undefined
}

/**
 * Validates persisted collection items one by one: invalid items are moved to
 * `<key>:corrupted` and the rest is kept, so one broken record does not wipe the collection.
 * Returns `null` when there is nothing persisted (keep the current state).
 */
export const restoreItems = <T>(key: string, items: unknown, schema: z.ZodType<T>): T[] | null => {
  if (items === undefined) return null
  if (!Array.isArray(items)) {
    console.warn(`[storage] "${key}" is not a list, moved to backup`)
    backupCorrupted(key, items)
    return []
  }

  const valid: T[] = []
  const invalid: unknown[] = []
  for (const item of items) {
    const result = schema.safeParse(item)
    if (result.success) valid.push(result.data)
    else invalid.push(item)
  }
  if (invalid.length > 0) {
    console.warn(`[storage] ${invalid.length} invalid item(s) in "${key}", moved to backup`)
    backupCorrupted(key, invalid)
  }
  return valid
}

import { z } from 'zod'
import type { PersistStorage, StorageValue } from 'zustand/middleware'

/**
 * Reads a value from localStorage and validates it with the given schema.
 * Invalid or unparsable data is logged, removed and `null` is returned,
 * so the caller falls back to its default state.
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
    console.warn(`[storage] Invalid JSON in "${key}", resetting`, error)
    removeState(key)
    return null
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    console.warn(`[storage] Invalid data in "${key}", resetting`, z.prettifyError(result.error))
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

/** Storage adapter for zustand `persist` that validates state via zod on read. */
export const createZodStorage = <S>(schema: z.ZodType<S>): PersistStorage<S> => {
  const persistedSchema = z.object({
    state: schema,
    version: z.number().optional(),
  })

  return {
    getItem: (name): StorageValue<S> | null => loadState(name, persistedSchema),
    setItem: (name, value) => saveState(name, value),
    removeItem: (name) => removeState(name),
  }
}

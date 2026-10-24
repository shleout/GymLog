import { z } from 'zod'

export const TimestampSchema = z.iso.datetime({ offset: true })

/**
 * Fields every synced record carries. `updatedAt` resolves conflicts (last write wins),
 * `deletedAt` is a soft delete: a removed record must still reach other devices as a tombstone.
 * `deletedAt` is nullable rather than optional so "not deleted" survives JSON round trips explicitly.
 */
export const SyncMetaSchema = z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  deletedAt: TimestampSchema.nullable(),
})

export type SyncMeta = z.infer<typeof SyncMetaSchema>

export const nowIso = (): string => new Date().toISOString()

export const createSyncMeta = (now: string = nowIso()): SyncMeta => ({
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
})

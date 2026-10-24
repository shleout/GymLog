import { SyncMetaSchema, TimestampSchema, type SyncMeta } from '@gymlog/schemas'

export { SyncMetaSchema, TimestampSchema, type SyncMeta }

export const nowIso = (): string => new Date().toISOString()

export const createSyncMeta = (now: string = nowIso()): SyncMeta => ({
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
})

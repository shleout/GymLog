import type { z } from 'zod'
import type { RejectedRecordSchema, SyncStateSchema } from './schemas'

export type SyncState = z.infer<typeof SyncStateSchema>
export type RejectedRecord = z.infer<typeof RejectedRecordSchema>

/** Transient, not persisted: what the sync loop is doing right now. */
export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error'

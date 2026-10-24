import type { z } from 'zod'
import type { RejectedRecordSchema, SyncStateSchema } from './schemas'

export type SyncState = z.infer<typeof SyncStateSchema>
export type RejectedRecord = z.infer<typeof RejectedRecordSchema>
/** The signed-in account, as far as sync needs it. */
export type SyncOwner = { id: string; email: string }

/** Transient, not persisted: what the sync loop is doing right now. */
export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error'

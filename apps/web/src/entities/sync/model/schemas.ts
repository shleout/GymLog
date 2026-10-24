import { z } from 'zod'

export const RejectedRecordSchema = z.object({
  /** Version the server rejected: the record is retried once it's edited again. */
  updatedAt: z.string(),
  issues: z.array(z.string()),
})

export const SyncStateSchema = z.object({
  /**
   * Account the local data and the rest of this state belong to; `null` — data created
   * before any sign-in (uploaded to whoever signs in first).
   */
  userId: z.string().nullable(),
  userEmail: z.string().nullable(),
  /** Server revision already pulled. */
  cursor: z.number().int().min(0),
  /**
   * Record key (`workout:<id>`, `profile`) → `updatedAt` the server is known to have.
   * A record is pending when its local `updatedAt` differs — the outbox is derived from this.
   */
  synced: z.record(z.string(), z.string()),
  rejected: z.record(z.string(), RejectedRecordSchema),
  lastSyncedAt: z.string().nullable(),
})

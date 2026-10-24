import { isFuture, parseISO } from 'date-fns'
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

/** Day of a workout / measurement session: ISO string, not in the future. */
export const RecordDateSchema = z.iso
  .datetime({ offset: true, error: 'Некорректная дата' })
  .refine((value) => !isFuture(parseISO(value)), { message: 'Дата не может быть в будущем' })

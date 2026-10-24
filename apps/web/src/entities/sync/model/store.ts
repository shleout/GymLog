import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { backupCorrupted, createPersistStorage } from '@/shared/lib'
import { migrateSyncState, SYNC_STATE_VERSION } from './migrations'
import { SyncStateSchema } from './schemas'
import type { RejectedRecord, SyncOwner, SyncState, SyncStatus } from './types'

const STORAGE_KEY = 'gymlog-sync'

const initialState = (owner: SyncOwner | null): SyncState => ({
  userId: owner?.id ?? null,
  userEmail: owner?.email ?? null,
  cursor: 0,
  synced: {},
  rejected: {},
  lastSyncedAt: null,
})

type SyncActions = {
  /** Starts over for another account: everything local becomes pending, pull starts at 0. */
  resetForUser: (owner: SyncOwner) => void
  /** Local data was wiped: nothing on the device belongs to any account. */
  clearSyncState: () => void
  markSynced: (versions: Record<string, string>) => void
  markRejected: (records: Record<string, RejectedRecord>) => void
  setCursor: (cursor: number) => void
  setStatus: (status: SyncStatus, error?: string) => void
  finishSync: (at: string) => void
}

export type SyncStore = SyncState & {
  status: SyncStatus
  error: string | null
} & SyncActions

export const useSyncStore = create<SyncStore>()(
  persist(
    (set): SyncStore => ({
      ...initialState(null),
      status: 'idle',
      error: null,
      resetForUser: (owner) => set(initialState(owner)),
      clearSyncState: () => set({ ...initialState(null), status: 'idle', error: null }),
      markSynced: (versions) =>
        set((state) => {
          const rejected = { ...state.rejected }
          for (const key of Object.keys(versions)) delete rejected[key]
          return { synced: { ...state.synced, ...versions }, rejected }
        }),
      markRejected: (records) => set((state) => ({ rejected: { ...state.rejected, ...records } })),
      setCursor: (cursor) => set({ cursor }),
      setStatus: (status, error) => set({ status, error: error ?? null }),
      finishSync: (at) => set({ status: 'idle', error: null, lastSyncedAt: at }),
    }),
    {
      name: STORAGE_KEY,
      version: SYNC_STATE_VERSION,
      storage: createPersistStorage(),
      migrate: migrateSyncState,
      // Validated as a whole: losing sync metadata is safe — everything is pushed and pulled
      // again, and last-write-wins makes the repeat a no-op.
      merge: (persisted, current) => {
        if (persisted === undefined) return current
        const result = SyncStateSchema.safeParse(persisted)
        if (result.success) return { ...current, ...result.data }
        console.warn(`[storage] Invalid sync state in "${STORAGE_KEY}", moved to backup`)
        backupCorrupted(STORAGE_KEY, persisted)
        return current
      },
      partialize: ({ userId, userEmail, cursor, synced, rejected, lastSyncedAt }): SyncState => ({
        userId,
        userEmail,
        cursor,
        synced,
        rejected,
        lastSyncedAt,
      }),
    },
  ),
)

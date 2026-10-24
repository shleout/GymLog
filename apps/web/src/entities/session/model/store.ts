import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { backupCorrupted, createPersistStorage, pickPersistedField } from '@/shared/lib'
import { migrateSessionState, SESSION_STATE_VERSION } from './migrations'
import { UserSchema } from './schemas'
import type { SessionState, User } from './types'

const STORAGE_KEY = 'gymlog-session'

type SessionActions = {
  setUser: (user: User) => void
  clearSession: () => void
}

export type SessionStore = SessionState & SessionActions

/**
 * Only the user is persisted, never tokens: it keeps the app open offline after a reload.
 * The access token lives in shared/api memory, the refresh token in an httpOnly cookie.
 */
export const useSessionStore = create<SessionStore>()(
  persist(
    (set): SessionStore => ({
      user: null,
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    {
      name: STORAGE_KEY,
      version: SESSION_STATE_VERSION,
      storage: createPersistStorage(),
      migrate: migrateSessionState,
      // Validation happens here, after migrate.
      merge: (persisted, current) => {
        const user = pickPersistedField(persisted, 'user')
        if (user === undefined || user === null) return current
        const result = UserSchema.safeParse(user)
        if (result.success) return { ...current, user: result.data }
        console.warn(`[storage] Invalid user in "${STORAGE_KEY}", moved to backup`)
        backupCorrupted(STORAGE_KEY, user)
        return current
      },
      partialize: (state): SessionState => ({ user: state.user }),
    },
  ),
)

export const useCurrentUser = (): User | null => useSessionStore((state) => state.user)

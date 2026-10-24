import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  backupCorrupted,
  createPersistStorage,
  isNewer,
  nowIso,
  pickPersistedField,
} from '@/shared/lib'
import { migrateProfileState, PROFILE_STATE_VERSION } from './migrations'
import { ProfileSchema } from './schemas'
import type { Profile, ProfileInput, ProfileState } from './types'

const STORAGE_KEY = 'gymlog-profile'

type ProfileActions = {
  updateProfile: (profile: ProfileInput) => void
  /** Profile from the server, applied only when newer (last write wins); `updatedAt` is kept. */
  applyRemoteProfile: (profile: Profile) => void
}

export type ProfileStore = ProfileState & ProfileActions

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get): ProfileStore => ({
      profile: { nickname: '', updatedAt: null },
      updateProfile: (profile) => set({ profile: { ...profile, updatedAt: nowIso() } }),
      applyRemoteProfile: (profile) => {
        const local = get().profile.updatedAt
        if (profile.updatedAt === null) return
        if (local === null || isNewer(profile.updatedAt, local)) set({ profile })
      },
    }),
    {
      name: STORAGE_KEY,
      version: PROFILE_STATE_VERSION,
      storage: createPersistStorage(),
      migrate: migrateProfileState,
      // Validation happens here, after migrate.
      merge: (persisted, current) => {
        const profile = pickPersistedField(persisted, 'profile')
        if (profile === undefined) return current
        const result = ProfileSchema.safeParse(profile)
        if (result.success) return { ...current, profile: result.data }
        console.warn(`[storage] Invalid profile in "${STORAGE_KEY}", moved to backup`)
        backupCorrupted(STORAGE_KEY, profile)
        return current
      },
      partialize: (state): ProfileState => ({ profile: state.profile }),
    },
  ),
)

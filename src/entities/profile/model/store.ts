import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createZodStorage } from '@/shared/lib'
import { ProfileStateSchema } from './schemas'
import type { Profile, ProfileState } from './types'

type ProfileActions = {
  updateProfile: (profile: Profile) => void
}

export type ProfileStore = ProfileState & ProfileActions

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set): ProfileStore => ({
      profile: { nickname: '' },
      updateProfile: (profile) => set({ profile }),
    }),
    {
      name: 'gymlog-profile',
      storage: createZodStorage(ProfileStateSchema),
      partialize: (state): ProfileState => ({ profile: state.profile }),
    },
  ),
)

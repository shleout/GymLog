import { RouterProvider } from 'react-router/dom'
import { useAdminUserStore } from '@/entities/admin-user'
import { useExerciseStore } from '@/entities/exercise'
import { useMeasurementStore } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { initSession, useSessionStore } from '@/entities/session'
import { useSyncStore } from '@/entities/sync'
import { useWorkoutStore } from '@/entities/workout'
import { startSync } from '@/features/sync'
import { syncPersistedStoresAcrossTabs } from '@/shared/lib'
import { router } from './router/router'

// Module level, not an effect: runs once even under StrictMode's double mount.
initSession()
startSync()
syncPersistedStoresAcrossTabs([
  useWorkoutStore,
  useExerciseStore,
  useMeasurementStore,
  useProfileStore,
  useSessionStore,
  useSyncStore,
])

// Admin data is an in-memory cache of what the previous account was allowed to see.
useSessionStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id) useAdminUserStore.getState().reset()
})

export const App = () => <RouterProvider router={router} />

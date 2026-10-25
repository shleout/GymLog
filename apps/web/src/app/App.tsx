import { RouterProvider } from 'react-router/dom'
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

export const App = () => <RouterProvider router={router} />

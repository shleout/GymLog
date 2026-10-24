import { useExerciseStore } from '@/entities/exercise'
import { useMeasurementStore } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { useSyncStore, type SyncOwner } from '@/entities/sync'
import { useWorkoutStore } from '@/entities/workout'
import { requestSync } from './syncEngine'

/** Wipes everything synced from the device; nothing local belongs to any account afterwards. */
export const clearLocalData = (): void => {
  useWorkoutStore.setState({ workouts: [] })
  useExerciseStore.setState({ exercises: [] })
  useMeasurementStore.setState({ measurements: [] })
  useProfileStore.setState({ profile: { nickname: '', updatedAt: null } })
  useSyncStore.getState().clearSyncState()
}

/** Keep the other account's data and upload it into this one. */
export const adoptLocalData = (owner: SyncOwner): void => {
  useSyncStore.getState().resetForUser(owner)
  requestSync()
}

/** Drop the other account's data and load this account's data from the server. */
export const discardLocalData = (owner: SyncOwner): void => {
  clearLocalData()
  useSyncStore.getState().resetForUser(owner)
  requestSync()
}

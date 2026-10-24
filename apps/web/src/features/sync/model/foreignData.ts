import { useExerciseStore } from '@/entities/exercise'
import { useMeasurementStore } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { useCurrentUser } from '@/entities/session'
import { useSyncStore } from '@/entities/sync'
import { useWorkoutStore } from '@/entities/workout'

const isActive = (record: { deletedAt: string | null }): boolean => record.deletedAt === null

const hasLocalData = (): boolean =>
  useWorkoutStore.getState().workouts.some(isActive) ||
  useExerciseStore.getState().exercises.some(isActive) ||
  useMeasurementStore.getState().measurements.some(isActive) ||
  useProfileStore.getState().profile.updatedAt !== null

/**
 * The device holds data of another account. Data without an owner (created before any sign-in)
 * doesn't count: it silently goes to whoever signs in first.
 */
export const hasForeignData = (userId: string): boolean => {
  const owner = useSyncStore.getState().userId
  return owner !== null && owner !== userId && hasLocalData()
}

/** Email of the other account whose data is on the device, while the user hasn't decided. */
export const useForeignDataOwner = (): string | null => {
  const user = useCurrentUser()
  const ownerId = useSyncStore((state) => state.userId)
  const ownerEmail = useSyncStore((state) => state.userEmail)
  // Every hook is called unconditionally (rules of hooks), then combined.
  const hasWorkouts = useWorkoutStore((state) => state.workouts.some(isActive))
  const hasExercises = useExerciseStore((state) => state.exercises.some(isActive))
  const hasMeasurements = useMeasurementStore((state) => state.measurements.some(isActive))
  const profileEdited = useProfileStore((state) => state.profile.updatedAt !== null)
  const present = hasWorkouts || hasExercises || hasMeasurements || profileEdited
  if (!user || ownerId === null || ownerId === user.id || !present) return null
  return ownerEmail ?? 'другого аккаунта'
}

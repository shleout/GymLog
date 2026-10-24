import { useMemo } from 'react'
import { useExerciseStore } from '@/entities/exercise'
import { useMeasurementStore } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { useSyncStore } from '@/entities/sync'
import { useWorkoutStore } from '@/entities/workout'
import { countPending } from './pending'

/** Local changes the server hasn't confirmed yet (tombstones included). */
export const usePendingCount = (): number => {
  const workouts = useWorkoutStore((state) => state.workouts)
  const exercises = useExerciseStore((state) => state.exercises)
  const measurements = useMeasurementStore((state) => state.measurements)
  const profile = useProfileStore((state) => state.profile)
  const synced = useSyncStore((state) => state.synced)
  const rejected = useSyncStore((state) => state.rejected)

  return useMemo(
    () => countPending({ workouts, exercises, measurements, profile }, { synced, rejected }),
    [workouts, exercises, measurements, profile, synced, rejected],
  )
}

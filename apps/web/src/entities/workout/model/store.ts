import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import {
  createPersistStorage,
  createSyncMeta,
  mergeRemote,
  nowIso,
  pickPersistedField,
  restoreItems,
} from '@/shared/lib'
import { migrateWorkoutState, WORKOUT_STATE_VERSION } from './migrations'
import { WorkoutSchema } from './schemas'
import type { Workout, WorkoutEntry, WorkoutInput, WorkoutState } from './types'

const STORAGE_KEY = 'gymlog-workouts'

type WorkoutActions = {
  addWorkout: (workout: WorkoutInput) => void
  /** Replaces the data of the workout with the same id. */
  updateWorkout: (workout: WorkoutInput) => void
  /** Soft delete: the record stays as a tombstone for sync. */
  deleteWorkout: (id: string) => void
  addExerciseToWorkout: (workoutId: string, entry: WorkoutEntry) => void
  /** Records from the server, merged last-write-wins; `updatedAt` is kept as is. */
  applyRemoteWorkouts: (workouts: Workout[]) => void
}

export type WorkoutStore = WorkoutState & WorkoutActions

const updateById = (
  workouts: Workout[],
  id: string,
  update: (workout: Workout) => Partial<Workout>,
): Workout[] =>
  workouts.map((workout) =>
    workout.id === id ? { ...workout, ...update(workout), updatedAt: nowIso() } : workout,
  )

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set): WorkoutStore => ({
      workouts: [],
      addWorkout: (workout) =>
        set((state) => ({ workouts: [...state.workouts, { ...workout, ...createSyncMeta() }] })),
      updateWorkout: ({ id, ...data }) =>
        set((state) => ({ workouts: updateById(state.workouts, id, () => data) })),
      deleteWorkout: (id) =>
        set((state) => ({ workouts: updateById(state.workouts, id, () => ({ deletedAt: nowIso() })) })),
      addExerciseToWorkout: (workoutId, entry) =>
        set((state) => ({
          workouts: updateById(state.workouts, workoutId, (workout) => ({
            entries: [...workout.entries, entry],
          })),
        })),
      applyRemoteWorkouts: (workouts) =>
        set((state) => ({ workouts: mergeRemote(state.workouts, workouts) })),
    }),
    {
      name: STORAGE_KEY,
      version: WORKOUT_STATE_VERSION,
      storage: createPersistStorage(),
      migrate: migrateWorkoutState,
      // Validation happens here, after migrate: each record separately.
      merge: (persisted, current) => ({
        ...current,
        workouts:
          restoreItems(STORAGE_KEY, pickPersistedField(persisted, 'workouts'), WorkoutSchema) ??
          current.workouts,
      }),
      partialize: (state): WorkoutState => ({ workouts: state.workouts }),
    },
  ),
)

export const selectActiveWorkouts = (state: WorkoutState): Workout[] =>
  state.workouts.filter((workout) => workout.deletedAt === null)

/** Workouts that are not deleted. `useShallow` keeps the filtered array referentially stable. */
export const useWorkouts = (): Workout[] => useWorkoutStore(useShallow(selectActiveWorkouts))

export const useWorkoutById = (id: string | undefined): Workout | undefined =>
  useWorkoutStore((state) =>
    state.workouts.find((workout) => workout.id === id && workout.deletedAt === null),
  )

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createZodStorage } from '@/shared/lib'
import { WorkoutStateSchema } from './schemas'
import type { Workout, WorkoutEntry, WorkoutState } from './types'

type WorkoutActions = {
  addWorkout: (workout: Workout) => void
  /** Replaces the workout with the same id. */
  updateWorkout: (workout: Workout) => void
  deleteWorkout: (id: string) => void
  addExerciseToWorkout: (workoutId: string, entry: WorkoutEntry) => void
}

export type WorkoutStore = WorkoutState & WorkoutActions

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set): WorkoutStore => ({
      workouts: [],
      addWorkout: (workout) => set((state) => ({ workouts: [...state.workouts, workout] })),
      updateWorkout: (workout) =>
        set((state) => ({
          workouts: state.workouts.map((item) => (item.id === workout.id ? workout : item)),
        })),
      deleteWorkout: (id) =>
        set((state) => ({ workouts: state.workouts.filter((workout) => workout.id !== id) })),
      addExerciseToWorkout: (workoutId, entry) =>
        set((state) => ({
          workouts: state.workouts.map((workout) =>
            workout.id === workoutId ? { ...workout, entries: [...workout.entries, entry] } : workout,
          ),
        })),
    }),
    {
      name: 'gymlog-workouts',
      storage: createZodStorage(WorkoutStateSchema),
      partialize: (state): WorkoutState => ({ workouts: state.workouts }),
    },
  ),
)

export const useWorkoutById = (id: string | undefined): Workout | undefined =>
  useWorkoutStore((state) => state.workouts.find((workout) => workout.id === id))

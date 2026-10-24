import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cleanName, createId, createZodStorage } from '@/shared/lib'
import { normalizeExerciseName } from '../lib/normalizeExerciseName'
import { ExerciseStateSchema } from './schemas'
import type { Exercise, ExerciseState } from './types'

type ExerciseActions = {
  /** Returns the saved exercise with this name or creates a new one. */
  ensureExercise: (name: string) => Exercise
}

export type ExerciseStore = ExerciseState & ExerciseActions

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get): ExerciseStore => ({
      exercises: [],
      ensureExercise: (name) => {
        const key = normalizeExerciseName(name)
        const existing = get().exercises.find(
          (exercise) => normalizeExerciseName(exercise.name) === key,
        )
        if (existing) return existing

        const exercise: Exercise = { id: createId(), name: cleanName(name) }
        set((state) => ({ exercises: [...state.exercises, exercise] }))
        return exercise
      },
    }),
    {
      name: 'gymlog-exercises',
      storage: createZodStorage(ExerciseStateSchema),
      partialize: (state): ExerciseState => ({ exercises: state.exercises }),
    },
  ),
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  cleanName,
  createId,
  createPersistStorage,
  createSyncMeta,
  mergeRemote,
  nowIso,
  pickPersistedField,
  restoreItems,
} from '@/shared/lib'
import { normalizeExerciseName } from '../lib/normalizeExerciseName'
import { EXERCISE_STATE_VERSION, migrateExerciseState } from './migrations'
import { ExerciseSchema } from './schemas'
import type { Exercise, ExerciseState } from './types'

const STORAGE_KEY = 'gymlog-exercises'

type ExerciseActions = {
  /** Returns the saved exercise with this name or creates a new one. */
  ensureExercise: (name: string) => Exercise
  /** Records from the server, merged last-write-wins; `updatedAt` is kept as is. */
  applyRemoteExercises: (exercises: Exercise[]) => void
  /** Soft delete: the records stay as tombstones for sync. */
  deleteExercises: (ids: string[]) => void
}

export type ExerciseStore = ExerciseState & ExerciseActions

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get): ExerciseStore => ({
      exercises: [],
      ensureExercise: (name) => {
        const key = normalizeExerciseName(name)
        const existing = get().exercises.find(
          (exercise) => exercise.deletedAt === null && normalizeExerciseName(exercise.name) === key,
        )
        if (existing) return existing

        const exercise: Exercise = { id: createId(), name: cleanName(name), ...createSyncMeta() }
        set((state) => ({ exercises: [...state.exercises, exercise] }))
        return exercise
      },
      applyRemoteExercises: (exercises) =>
        set((state) => ({ exercises: mergeRemote(state.exercises, exercises) })),
      deleteExercises: (ids) =>
        set((state) => {
          const now = nowIso()
          return {
            exercises: state.exercises.map((exercise) =>
              ids.includes(exercise.id) ? { ...exercise, deletedAt: now, updatedAt: now } : exercise,
            ),
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: EXERCISE_STATE_VERSION,
      storage: createPersistStorage(),
      migrate: migrateExerciseState,
      // Validation happens here, after migrate: each record separately.
      merge: (persisted, current) => ({
        ...current,
        exercises:
          restoreItems(STORAGE_KEY, pickPersistedField(persisted, 'exercises'), ExerciseSchema) ??
          current.exercises,
      }),
      partialize: (state): ExerciseState => ({ exercises: state.exercises }),
    },
  ),
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
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
import { findExerciseByName } from '../lib/findExerciseByName'
import { normalizeExerciseName } from '../lib/normalizeExerciseName'
import { EXERCISE_STATE_VERSION, migrateExerciseState } from './migrations'
import { ExerciseSchema } from './schemas'
import type { Exercise, ExerciseState } from './types'

const STORAGE_KEY = 'gymlog-exercises'

type ExerciseActions = {
  /**
   * Returns the active exercise with this name, restores a deleted one (keeping its id, so
   * old workouts and history stay attached) or creates a new one.
   */
  ensureExercise: (name: string) => Exercise
  /** The caller checks that the name is not empty and not taken by another exercise. */
  renameExercise: (id: string, name: string) => void
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
        const existing = findExerciseByName(get().exercises, name)
        if (existing) return existing

        // Several tombstones may share the name (merged duplicates); the latest deleted one
        // is the one the user removed and the one their workouts point to.
        const key = normalizeExerciseName(name)
        const tombstone = get()
          .exercises.filter(
            (exercise) =>
              exercise.deletedAt !== null && normalizeExerciseName(exercise.name) === key,
          )
          .sort((a, b) => Date.parse(b.deletedAt ?? '') - Date.parse(a.deletedAt ?? ''))[0]
        if (tombstone) {
          const restored: Exercise = { ...tombstone, deletedAt: null, updatedAt: nowIso() }
          set((state) => ({
            exercises: state.exercises.map((exercise) =>
              exercise.id === restored.id ? restored : exercise,
            ),
          }))
          return restored
        }

        const exercise: Exercise = { id: createId(), name: cleanName(name), ...createSyncMeta() }
        set((state) => ({ exercises: [...state.exercises, exercise] }))
        return exercise
      },
      renameExercise: (id, name) =>
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.id === id ? { ...exercise, name: cleanName(name), updatedAt: nowIso() } : exercise,
          ),
        })),
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

export const selectActiveExercises = (state: ExerciseState): Exercise[] =>
  state.exercises.filter((exercise) => exercise.deletedAt === null)

/** Exercises that are not deleted. `useShallow` keeps the filtered array referentially stable. */
export const useExercises = (): Exercise[] => useExerciseStore(useShallow(selectActiveExercises))

export const useExerciseById = (id: string | undefined): Exercise | undefined =>
  useExerciseStore((state) =>
    state.exercises.find((exercise) => exercise.id === id && exercise.deletedAt === null),
  )

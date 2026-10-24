import { normalizeExerciseName, useExerciseStore, type Exercise } from '@/entities/exercise'
import { useWorkoutStore } from '@/entities/workout'

/** Earlier `createdAt` wins, then the smaller id: every device picks the same survivor. */
const isPreferred = (a: Exercise, b: Exercise): boolean => {
  const byCreated = Date.parse(a.createdAt) - Date.parse(b.createdAt)
  return byCreated !== 0 ? byCreated < 0 : a.id < b.id
}

/**
 * Two devices may create "Жим лёжа" offline with different ids; after sync the dictionary
 * has both. Keeps one per normalized name, points workouts to it and soft-deletes the rest.
 * The rule is deterministic, so devices converge without coordinating; the resulting edits
 * are ordinary local changes and get pushed.
 */
export const mergeDuplicateExercises = (): void => {
  const active = useExerciseStore.getState().exercises.filter((exercise) => exercise.deletedAt === null)
  const survivors = new Map<string, Exercise>()
  for (const exercise of active) {
    const key = normalizeExerciseName(exercise.name)
    const current = survivors.get(key)
    if (!current || isPreferred(exercise, current)) survivors.set(key, exercise)
  }
  if (survivors.size === active.length) return

  const replacements: Record<string, string> = {}
  for (const exercise of active) {
    const survivor = survivors.get(normalizeExerciseName(exercise.name))
    if (survivor && survivor.id !== exercise.id) replacements[exercise.id] = survivor.id
  }
  useWorkoutStore.getState().replaceExerciseIds(replacements)
  useExerciseStore.getState().deleteExercises(Object.keys(replacements))
}

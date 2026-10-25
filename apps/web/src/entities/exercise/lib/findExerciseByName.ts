import type { Exercise } from '../model/types'
import { normalizeExerciseName } from './normalizeExerciseName'

/** Active exercise whose name matches `name` after normalization. */
export const findExerciseByName = (exercises: Exercise[], name: string): Exercise | undefined => {
  const key = normalizeExerciseName(name)
  return exercises.find(
    (exercise) => exercise.deletedAt === null && normalizeExerciseName(exercise.name) === key,
  )
}

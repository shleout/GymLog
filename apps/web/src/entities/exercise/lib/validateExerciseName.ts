import { ExerciseSchema } from '../model/schemas'
import type { Exercise } from '../model/types'
import { findExerciseByName } from './findExerciseByName'

/**
 * Error message for a new name or `undefined` if it is fine. `exceptId` is the exercise
 * being renamed: changing only case or spaces of its own name is allowed.
 */
export const validateExerciseName = (
  exercises: Exercise[],
  name: string,
  exceptId?: string,
): string | undefined => {
  const result = ExerciseSchema.shape.name.safeParse(name)
  if (!result.success) return result.error.issues[0]?.message

  const existing = findExerciseByName(exercises, name)
  if (existing && existing.id !== exceptId) return `Упражнение «${existing.name}» уже есть`
  return undefined
}

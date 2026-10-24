import { z } from 'zod'

export const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Введите название упражнения'),
  muscleGroup: z.string().optional(),
})

export const ExerciseStateSchema = z.object({
  exercises: z.array(ExerciseSchema),
})

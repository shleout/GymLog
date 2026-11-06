import { z } from 'zod'
import { SyncMetaSchema } from './syncMeta.js'

/** `reps` — sets of weight × reps; `time` — holds measured by time under load (optionally with weight). */
export const EXERCISE_KINDS = ['reps', 'time'] as const
export const ExerciseKindSchema = z.enum(EXERCISE_KINDS)

export const ExerciseSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1, 'Введите название упражнения'),
    muscleGroup: z.string().optional(),
    /** Absent in records from before v2.8.0 — those are `reps`. */
    kind: ExerciseKindSchema.default('reps'),
  })
  .extend(SyncMetaSchema.shape)

export type ExerciseKind = z.infer<typeof ExerciseKindSchema>
export type Exercise = z.infer<typeof ExerciseSchema>

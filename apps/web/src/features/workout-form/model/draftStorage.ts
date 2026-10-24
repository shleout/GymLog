import { useState } from 'react'
import { z } from 'zod'
import { hasDraft } from '@/shared/lib'
import type { WorkoutDraft } from './types'

const SetDraftSchema = z.object({
  key: z.string(),
  weight: z.string(),
  reps: z.string(),
  completed: z.boolean(),
})

/** Shape of the stored draft; typed against `WorkoutDraft` so the two can't drift apart. */
export const WorkoutDraftSchema: z.ZodType<WorkoutDraft> = z.object({
  date: z.string(),
  entries: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      sets: z.array(SetDraftSchema),
    }),
  ),
})

const NEW_WORKOUT_DRAFT_KEY = 'workout:new'

/** One draft per form: a new workout, or editing a particular one. */
export const workoutDraftKey = (workoutId?: string): string =>
  workoutId ? `workout:${workoutId}` : NEW_WORKOUT_DRAFT_KEY

/** An unfinished new workout is waiting; read once per mount (the list page remounts on return). */
export const useHasNewWorkoutDraft = (): boolean => useState(() => hasDraft(NEW_WORKOUT_DRAFT_KEY))[0]

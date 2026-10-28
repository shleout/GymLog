import { useMemo } from 'react'
import { findExerciseByName, useExercises } from '@/entities/exercise'
import {
  getExerciseSessions,
  getMaxRepsRecords,
  getRepRecord,
  useWorkouts,
  type ExerciseSession,
  type MaxRepsRecord,
  type RepRecord,
} from '@/entities/workout'
import { isoToDateInputValue } from '@/shared/lib'
import type { SetDraft } from './types'

type ExerciseHintParams = {
  name: string
  sets: SetDraft[]
  /** Draft date, `yyyy-MM-dd`: later workouts are not "last time" for it. */
  date: string
  /** The workout being edited, so it doesn't hint itself. */
  workoutId?: string
}

export type ExerciseHint = {
  last: ExerciseSession
  /**
   * With weight — the heaviest set for the reps being entered (once they are entered);
   * without weight — the most reps in one set.
   */
  record?: { kind: 'weight'; reps: number; best?: RepRecord } | { kind: 'reps'; best: MaxRepsRecord }
  /**
   * The latest note about the exercise, even if it was left several workouts ago:
   * notes like machine settings are written once and stay relevant.
   */
  note?: { session: ExerciseSession; text: string }
}

/** Reps of the last set with a valid value: usually the one being typed. */
const getCurrentReps = (sets: SetDraft[]): number | undefined => {
  for (const set of [...sets].reverse()) {
    const reps = Number(set.reps.trim())
    if (set.reps.trim() && Number.isInteger(reps) && reps > 0) return reps
  }
  return undefined
}

/** What the user did with this exercise before: the last workout and the record for current reps. */
export const useExerciseHint = ({ name, sets, date, workoutId }: ExerciseHintParams): ExerciseHint | undefined => {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const exerciseId = findExerciseByName(exercises, name)?.id

  const sessions = useMemo(
    () =>
      exerciseId
        ? getExerciseSessions(
            workouts.filter((workout) => workout.id !== workoutId),
            exerciseId,
          ).filter((session) => isoToDateInputValue(session.date) <= date)
        : [],
    [workouts, exerciseId, workoutId, date],
  )

  const last = sessions[0]
  if (!last) return undefined

  const noted = sessions.find((session) => session.notes.length > 0)
  const note = noted && { session: noted, text: noted.notes.join('\n') }

  const weighted = sessions.some((session) => session.sets.some((set) => set.weight !== undefined))
  if (!weighted) {
    const best = getMaxRepsRecords(sessions)[0]
    return { last, record: best ? { kind: 'reps', best } : undefined, note }
  }
  const reps = getCurrentReps(sets)
  return {
    last,
    record: reps === undefined ? undefined : { kind: 'weight', reps, best: getRepRecord(sessions, reps) },
    note,
  }
}

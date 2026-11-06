import { useMemo } from 'react'
import { findExerciseByName, useExercises } from '@/entities/exercise'
import {
  filterSessionsByMode,
  getExerciseSessions,
  getMaxRepsRecords,
  getMaxTimeRecords,
  getRepRecord,
  getTimeRecord,
  useWorkouts,
  type ExerciseSession,
  type MaxRepsRecord,
  type MaxTimeRecord,
  type RepRecord,
  type SetMode,
  type TimeRecord,
} from '@/entities/workout'
import { isoToDateInputValue } from '@/shared/lib'
import type { SetDraft } from './types'

type ExerciseHintParams = {
  name: string
  /** Mode of the entry: the hint shows only sets of that mode (reps and holds don't compare). */
  kind: SetMode
  sets: SetDraft[]
  /** Draft date, `yyyy-MM-dd`: later workouts are not "last time" for it. */
  date: string
  /** The workout being edited, so it doesn't hint itself. */
  workoutId?: string
}

export type ExerciseHint = {
  /** Last workout with the exercise in the entry's mode; absent if it was only done the other way. */
  last?: ExerciseSession
  /**
   * With weight — the heaviest set for the reps (or hold time) being entered, once they are
   * entered; without weight — the most reps (the longest hold) in one set.
   */
  record?:
    | { kind: 'weight'; reps: number; best?: RepRecord }
    | { kind: 'reps'; best: MaxRepsRecord }
    | { kind: 'holdWeight'; durationSec: number; best?: TimeRecord }
    | { kind: 'hold'; best: MaxTimeRecord }
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

/** Seconds of the last set with a valid duration: usually the one being typed. */
const getCurrentDuration = (sets: SetDraft[]): number | undefined => {
  for (const set of [...sets].reverse()) {
    const minutes = Number(set.minutes.trim() || 0)
    const seconds = Number(set.seconds.trim() || 0)
    const total = minutes * 60 + seconds
    if (Number.isInteger(total) && total > 0 && minutes >= 0 && seconds >= 0) return total
  }
  return undefined
}

/** What the user did with this exercise before: the last workout and the record for current reps. */
export const useExerciseHint = ({ name, kind, sets, date, workoutId }: ExerciseHintParams): ExerciseHint | undefined => {
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

  if (sessions.length === 0) return undefined

  // The note is about the exercise itself (machine settings), whichever way it was done.
  const noted = sessions.find((session) => session.notes.length > 0)
  const note = noted && { session: noted, text: noted.notes.join('\n') }

  const modeSessions = filterSessionsByMode(sessions, kind)
  const last = modeSessions[0]
  if (!last) return note ? { note } : undefined

  const weighted = modeSessions.some((session) => session.sets.some((set) => set.weight !== undefined))
  if (kind === 'time') {
    if (!weighted) {
      const best = getMaxTimeRecords(modeSessions)[0]
      return { last, record: best ? { kind: 'hold', best } : undefined, note }
    }
    const durationSec = getCurrentDuration(sets)
    return {
      last,
      record:
        durationSec === undefined
          ? undefined
          : { kind: 'holdWeight', durationSec, best: getTimeRecord(modeSessions, durationSec) },
      note,
    }
  }
  if (!weighted) {
    const best = getMaxRepsRecords(modeSessions)[0]
    return { last, record: best ? { kind: 'reps', best } : undefined, note }
  }
  const reps = getCurrentReps(sets)
  return {
    last,
    record: reps === undefined ? undefined : { kind: 'weight', reps, best: getRepRecord(modeSessions, reps) },
    note,
  }
}

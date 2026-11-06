import type { ExerciseKind } from '@/entities/exercise'

/** Form draft keeps raw input strings; they are parsed by `WorkoutFormSchema` on submit. */
export type SetDraft = {
  /** Also used as the set id on save, so editing keeps ids stable. */
  key: string
  weight: string
  reps: string
  /** Duration of a hold (exercise kind `time`): minutes and seconds are separate fields. */
  minutes: string
  seconds: string
  /** Reps in reserve; empty when not rated. */
  rir: string
  completed: boolean
}

/** Set fields edited as text. */
export type SetField = 'weight' | 'reps' | 'minutes' | 'seconds' | 'rir'

export type EntryDraft = {
  key: string
  name: string
  /**
   * Kind for a new exercise. For a known name the exercise's own kind wins
   * (see `resolveEntryKinds`).
   */
  kind: ExerciseKind
  sets: SetDraft[]
  note: string
}

export type WorkoutDraft = {
  /** `yyyy-MM-dd`, the value of `<input type="date">`. */
  date: string
  entries: EntryDraft[]
  note: string
}

export type { FormErrors } from '@/shared/lib'

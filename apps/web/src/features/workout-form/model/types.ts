import type { SetMode } from '@/entities/workout'

/** Form draft keeps raw input strings; they are parsed by `WorkoutFormSchema` on submit. */
export type SetDraft = {
  /** Also used as the set id on save, so editing keeps ids stable. */
  key: string
  weight: string
  reps: string
  /** Duration of a hold (entry mode `time`): minutes and seconds are separate fields. */
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
   * How the sets of this entry are measured. Chosen per entry, not per exercise: the same
   * exercise can be done for reps in one workout and as a hold in another. Fields of the
   * other mode stay in the draft, so switching back and forth loses nothing.
   */
  kind: SetMode
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

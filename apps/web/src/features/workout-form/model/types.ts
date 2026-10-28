/** Form draft keeps raw input strings; they are parsed by `WorkoutFormSchema` on submit. */
export type SetDraft = {
  /** Also used as the set id on save, so editing keeps ids stable. */
  key: string
  weight: string
  reps: string
  /** Reps in reserve; empty when not rated. */
  rir: string
  completed: boolean
}

/** Set fields edited as text. */
export type SetField = 'weight' | 'reps' | 'rir'

export type EntryDraft = {
  key: string
  name: string
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

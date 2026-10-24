/** Form draft keeps raw input strings; they are parsed by `WorkoutFormSchema` on submit. */
export type SetDraft = {
  /** Also used as the set id on save, so editing keeps ids stable. */
  key: string
  weight: string
  reps: string
  completed: boolean
}

export type EntryDraft = {
  key: string
  name: string
  sets: SetDraft[]
}

export type WorkoutDraft = {
  /** `yyyy-MM-dd`, the value of `<input type="date">`. */
  date: string
  entries: EntryDraft[]
}

export type { FormErrors } from '@/shared/lib'

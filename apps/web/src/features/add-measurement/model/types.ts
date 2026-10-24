import type { MeasuredValue } from '@/entities/measurement'

/** Form draft keeps raw input strings; they are parsed by `MeasurementFormSchema` on submit. */
export type PartDraft = {
  key: string
  name: string
  value: string
  /** Body part from previous sessions: its name is fixed, the previous value is shown as a hint. */
  known: boolean
  previous?: MeasuredValue
}

export type MeasurementDraft = {
  /** `yyyy-MM-dd`, the value of `<input type="date">`. */
  date: string
  weight: string
  parts: PartDraft[]
}

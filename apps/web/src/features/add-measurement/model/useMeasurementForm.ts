import { useMemo, useState } from 'react'
import {
  getLatestMeasurements,
  selectActiveMeasurements,
  useMeasurementStore,
} from '@/entities/measurement'
import {
  cleanName,
  collectErrors,
  createId,
  getTodayInputValue,
  usePersistentDraft,
  type FormErrors,
} from '@/shared/lib'
import { MEASUREMENT_DRAFT_KEY, MeasurementDraftSchema } from './draftStorage'
import { MeasurementFormSchema } from './formSchema'
import type { MeasurementDraft, PartDraft } from './types'

const createPartDraft = (): PartDraft => ({ key: createId(), name: '', value: '', known: false })

/** The draft survives reloads (see usePersistentDraft) until the measurements are saved. */
export const useMeasurementForm = () => {
  const addMeasurement = useMeasurementStore((state) => state.addMeasurement)
  // Snapshot of previous sessions taken once: hints must not change while the form is open.
  const [latest] = useState(() => getLatestMeasurements(selectActiveMeasurements(useMeasurementStore.getState())))
  const [today] = useState(getTodayInputValue)
  const { draft, setDraft, restored, clear, discard } = usePersistentDraft<MeasurementDraft>({
    key: MEASUREMENT_DRAFT_KEY,
    schema: MeasurementDraftSchema,
    create: () => ({
    date: today,
    weight: '',
    parts:
      latest.parts.length > 0
        ? latest.parts.map((part) => ({
            key: createId(),
            name: part.name,
            value: '',
            known: true,
            previous: { value: part.value, date: part.date },
          }))
        : [createPartDraft()],
    }),
  })
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo<FormErrors>(() => {
    if (!submitted) return {}
    const result = MeasurementFormSchema.safeParse(draft)
    return result.success ? {} : collectErrors(result.error)
  }, [draft, submitted])

  const setDate = (date: string) => setDraft((prev) => ({ ...prev, date }))

  const setWeight = (weight: string) => setDraft((prev) => ({ ...prev, weight }))

  const updatePart = (partKey: string, update: Partial<Pick<PartDraft, 'name' | 'value'>>) =>
    setDraft((prev) => ({
      ...prev,
      parts: prev.parts.map((part) => (part.key === partKey ? { ...part, ...update } : part)),
    }))

  const addPart = () => setDraft((prev) => ({ ...prev, parts: [...prev.parts, createPartDraft()] }))

  const removePart = (partKey: string) =>
    setDraft((prev) => ({ ...prev, parts: prev.parts.filter((part) => part.key !== partKey) }))

  /** Returns `true` when the measurement was saved. */
  const submit = (): boolean => {
    setSubmitted(true)
    const result = MeasurementFormSchema.safeParse(draft)
    if (!result.success) return false

    addMeasurement({
      id: createId(),
      date: result.data.date,
      weight: result.data.weight,
      values: result.data.parts.flatMap((part) =>
        part.value !== undefined && cleanName(part.name) !== ''
          ? [{ name: cleanName(part.name), value: part.value }]
          : [],
      ),
    })
    clear()
    return true
  }

  const startOver = () => {
    setSubmitted(false)
    discard()
  }

  return {
    today,
    previousWeight: latest.weight,
    draft,
    restored,
    startOver,
    errors,
    setDate,
    setWeight,
    updatePart,
    addPart,
    removePart,
    submit,
  }
}

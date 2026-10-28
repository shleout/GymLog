import { format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { useExerciseStore, type Exercise } from '@/entities/exercise'
import { useWorkoutStore, type Workout, type WorkoutInput } from '@/entities/workout'
import { collectErrors, createId, usePersistentDraft } from '@/shared/lib'
import { WorkoutDraftSchema, workoutDraftKey } from './draftStorage'
import { WorkoutFormSchema } from './formSchema'
import type { EntryDraft, FormErrors, SetDraft, SetField, WorkoutDraft } from './types'

const DATE_INPUT_FORMAT = 'yyyy-MM-dd'

const createSetDraft = (from?: SetDraft): SetDraft => ({
  key: createId(),
  weight: from?.weight ?? '',
  reps: from?.reps ?? '',
  // Not copied: effort changes from set to set, a copied value would be a guess.
  rir: '',
  completed: true,
})

const createEntryDraft = (): EntryDraft => ({
  key: createId(),
  name: '',
  sets: [createSetDraft()],
  note: '',
})

const getToday = (): string => format(new Date(), DATE_INPUT_FORMAT)

const workoutToDraft = (workout: Workout, exercises: Exercise[]): WorkoutDraft => ({
  date: format(parseISO(workout.date), DATE_INPUT_FORMAT),
  entries: workout.entries.map((entry) => ({
    key: createId(),
    name: exercises.find((exercise) => exercise.id === entry.exerciseId)?.name ?? '',
    sets: entry.sets.map((set) => ({
      key: set.id,
      weight: set.weight === undefined ? '' : String(set.weight),
      reps: String(set.reps),
      rir: set.rir === undefined ? '' : String(set.rir),
      completed: set.completed,
    })),
    note: entry.note ?? '',
  })),
  note: workout.note ?? '',
})

/**
 * Form state for creating a workout or, when `workout` is passed, editing it.
 * The draft survives reloads (see usePersistentDraft) until the workout is saved.
 */
export const useWorkoutForm = (workout?: Workout) => {
  const [today] = useState(getToday)
  const { draft, setDraft, restored, clear, discard } = usePersistentDraft<WorkoutDraft>({
    key: workoutDraftKey(workout?.id),
    schema: WorkoutDraftSchema,
    create: () =>
      workout
        ? workoutToDraft(workout, useExerciseStore.getState().exercises)
        : { date: today, entries: [createEntryDraft()], note: '' },
    base: workout?.updatedAt ?? null,
  })
  // Errors are shown only after the first submit attempt, then revalidated on every change.
  const [submitted, setSubmitted] = useState(false)

  const addWorkout = useWorkoutStore((state) => state.addWorkout)
  const updateWorkout = useWorkoutStore((state) => state.updateWorkout)
  const ensureExercise = useExerciseStore((state) => state.ensureExercise)

  const errors = useMemo<FormErrors>(() => {
    if (!submitted) return {}
    const result = WorkoutFormSchema.safeParse(draft)
    return result.success ? {} : collectErrors(result.error)
  }, [draft, submitted])

  const updateEntry = (entryKey: string, update: (entry: EntryDraft) => EntryDraft) =>
    setDraft((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => (entry.key === entryKey ? update(entry) : entry)),
    }))

  const setDate = (date: string) => setDraft((prev) => ({ ...prev, date }))

  const setNote = (note: string) => setDraft((prev) => ({ ...prev, note }))

  const addEntry = () =>
    setDraft((prev) => ({ ...prev, entries: [...prev.entries, createEntryDraft()] }))

  const removeEntry = (entryKey: string) =>
    setDraft((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.key !== entryKey),
    }))

  const setEntryName = (entryKey: string, name: string) =>
    updateEntry(entryKey, (entry) => ({ ...entry, name }))

  const setEntryNote = (entryKey: string, note: string) =>
    updateEntry(entryKey, (entry) => ({ ...entry, note }))

  /** New set copies the previous one: in the gym sets are usually repeated with the same numbers. */
  const addSet = (entryKey: string) =>
    updateEntry(entryKey, (entry) => ({
      ...entry,
      sets: [...entry.sets, createSetDraft(entry.sets.at(-1))],
    }))

  const removeSet = (entryKey: string, setKey: string) =>
    updateEntry(entryKey, (entry) => ({
      ...entry,
      sets: entry.sets.filter((set) => set.key !== setKey),
    }))

  const setSetField = (
    entryKey: string,
    setKey: string,
    field: SetField,
    value: string,
  ) =>
    updateEntry(entryKey, (entry) => ({
      ...entry,
      sets: entry.sets.map((set) => (set.key === setKey ? { ...set, [field]: value } : set)),
    }))

  /** Validates the draft and saves the workout. Returns the saved workout id or `null`. */
  const submit = (): string | null => {
    setSubmitted(true)
    const result = WorkoutFormSchema.safeParse(draft)
    if (!result.success) return null

    // Keep the original timestamp when the day was not changed.
    const date =
      workout && format(parseISO(workout.date), DATE_INPUT_FORMAT) === draft.date
        ? workout.date
        : result.data.date

    const saved: WorkoutInput = {
      id: workout?.id ?? createId(),
      date,
      entries: result.data.entries.map((entry, entryIndex) => ({
        exerciseId: ensureExercise(entry.name).id,
        sets: entry.sets.map((set, setIndex) => {
          const setDraft = draft.entries[entryIndex].sets[setIndex]
          return {
            id: setDraft.key,
            weight: set.weight,
            reps: set.reps,
            rir: set.rir,
            completed: setDraft.completed,
          }
        }),
        note: entry.note,
      })),
      note: result.data.note,
    }

    if (workout) updateWorkout(saved)
    else addWorkout(saved)
    clear()
    return saved.id
  }

  const startOver = () => {
    setSubmitted(false)
    discard()
  }

  /** Restored edit draft, but the workout has been saved since (e.g. on another device). */
  const changedSinceDraft = Boolean(
    restored && workout && restored.base !== null && restored.base !== workout.updatedAt,
  )

  return {
    today,
    draft,
    restored,
    changedSinceDraft,
    startOver,
    errors,
    setDate,
    setNote,
    addEntry,
    removeEntry,
    setEntryName,
    setEntryNote,
    addSet,
    removeSet,
    setSetField,
    submit,
  }
}

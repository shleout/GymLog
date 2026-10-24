import { format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { useExerciseStore, type Exercise } from '@/entities/exercise'
import { useWorkoutStore, type Workout } from '@/entities/workout'
import { collectErrors, createId } from '@/shared/lib'
import { WorkoutFormSchema } from './formSchema'
import type { EntryDraft, FormErrors, SetDraft, WorkoutDraft } from './types'

const DATE_INPUT_FORMAT = 'yyyy-MM-dd'

const createSetDraft = (from?: SetDraft): SetDraft => ({
  key: createId(),
  weight: from?.weight ?? '',
  reps: from?.reps ?? '',
  completed: true,
})

const createEntryDraft = (): EntryDraft => ({
  key: createId(),
  name: '',
  sets: [createSetDraft()],
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
      completed: set.completed,
    })),
  })),
})

/**
 * Form state for creating a workout or, when `workout` is passed, editing it.
 */
export const useWorkoutForm = (workout?: Workout) => {
  const [today] = useState(getToday)
  const [draft, setDraft] = useState<WorkoutDraft>(() =>
    workout
      ? workoutToDraft(workout, useExerciseStore.getState().exercises)
      : { date: today, entries: [createEntryDraft()] },
  )
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

  const addEntry = () =>
    setDraft((prev) => ({ ...prev, entries: [...prev.entries, createEntryDraft()] }))

  const removeEntry = (entryKey: string) =>
    setDraft((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.key !== entryKey),
    }))

  const setEntryName = (entryKey: string, name: string) =>
    updateEntry(entryKey, (entry) => ({ ...entry, name }))

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
    field: 'weight' | 'reps',
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

    const saved: Workout = {
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
            completed: setDraft.completed,
          }
        }),
      })),
    }

    if (workout) updateWorkout(saved)
    else addWorkout(saved)
    return saved.id
  }

  return {
    today,
    draft,
    errors,
    setDate,
    addEntry,
    removeEntry,
    setEntryName,
    addSet,
    removeSet,
    setSetField,
    submit,
  }
}

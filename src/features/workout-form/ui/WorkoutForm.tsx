import { useId, useMemo, type FormEvent } from 'react'
import { useExerciseStore } from '@/entities/exercise'
import type { Workout } from '@/entities/workout'
import { Button, Input } from '@/shared/ui'
import { useWorkoutForm } from '../model/useWorkoutForm'
import { ExerciseEntryCard } from './ExerciseEntryCard'

type WorkoutFormProps = {
  /** Workout to edit. Without it the form creates a new workout. */
  workout?: Workout
  onSuccess: (workoutId: string) => void
}

export const WorkoutForm = ({ workout, onSuccess }: WorkoutFormProps) => {
  const form = useWorkoutForm(workout)
  const exercises = useExerciseStore((state) => state.exercises)
  const exerciseOptions = useMemo(() => exercises.map((exercise) => exercise.name), [exercises])
  const dateId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const workoutId = form.submit()
    if (workoutId) onSuccess(workoutId)
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor={dateId} className="text-sm font-medium text-text-muted">
          Дата
        </label>
        <Input
          id={dateId}
          type="date"
          max={form.today}
          value={form.draft.date}
          invalid={Boolean(form.errors.date)}
          onChange={(event) => form.setDate(event.target.value)}
        />
        {form.errors.date && <p className="text-sm text-danger">{form.errors.date}</p>}
      </div>

      {form.draft.entries.map((entry, index) => (
        <ExerciseEntryCard
          key={entry.key}
          index={index}
          entry={entry}
          errors={form.errors}
          exerciseOptions={exerciseOptions}
          canRemove={form.draft.entries.length > 1}
          onNameChange={(name) => form.setEntryName(entry.key, name)}
          onRemove={() => form.removeEntry(entry.key)}
          onAddSet={() => form.addSet(entry.key)}
          onRemoveSet={(setKey) => form.removeSet(entry.key, setKey)}
          onSetChange={(setKey, field, value) => form.setSetField(entry.key, setKey, field, value)}
        />
      ))}
      {form.errors.entries && <p className="text-sm text-danger">{form.errors.entries}</p>}

      <Button variant="secondary" onClick={form.addEntry}>
        + Упражнение
      </Button>

      <Button type="submit" className="mt-2 min-h-14 text-lg">
        {workout ? 'Сохранить изменения' : 'Сохранить тренировку'}
      </Button>
    </form>
  )
}

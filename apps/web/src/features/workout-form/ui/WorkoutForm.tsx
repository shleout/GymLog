import { useId, useMemo, type FormEvent } from 'react'
import { useExercises } from '@/entities/exercise'
import type { Workout } from '@/entities/workout'
import { Button, Input, RestoredDraftNotice } from '@/shared/ui'
import { useWorkoutForm } from '../model/useWorkoutForm'
import { ExerciseEntryCard } from './ExerciseEntryCard'
import { NoteField } from './NoteField'

type WorkoutFormProps = {
  /** Workout to edit. Without it the form creates a new workout. */
  workout?: Workout
  onSuccess: (workoutId: string) => void
}

export const WorkoutForm = ({ workout, onSuccess }: WorkoutFormProps) => {
  const form = useWorkoutForm(workout)
  const exercises = useExercises()
  const exerciseOptions = useMemo(() => exercises.map((exercise) => exercise.name), [exercises])
  const dateId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const workoutId = form.submit()
    if (workoutId) onSuccess(workoutId)
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {form.restored && (
        <RestoredDraftNotice
          savedAt={form.restored.savedAt}
          warning={
            form.changedSinceDraft
              ? 'Тренировка изменилась с начала редактирования (возможно, на другом устройстве). Сохранение черновика перезапишет эти изменения.'
              : undefined
          }
          onDiscard={form.startOver}
        />
      )}

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
          date={form.draft.date}
          workoutId={workout?.id}
          errors={form.errors}
          exerciseOptions={exerciseOptions}
          canRemove={form.draft.entries.length > 1}
          onNameChange={(name) => form.setEntryName(entry.key, name)}
          onNoteChange={(note) => form.setEntryNote(entry.key, note)}
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

      <NoteField
        label="Заметка к тренировке"
        placeholder="Например: не выспался, болело плечо"
        value={form.draft.note}
        error={form.errors.note}
        onChange={form.setNote}
      />

      <Button type="submit" className="mt-2 min-h-14 text-lg">
        {workout ? 'Сохранить изменения' : 'Сохранить тренировку'}
      </Button>
    </form>
  )
}

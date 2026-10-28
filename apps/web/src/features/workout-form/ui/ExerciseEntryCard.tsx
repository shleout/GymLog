import { normalizeExerciseName } from '@/entities/exercise'
import { Button, Combobox } from '@/shared/ui'
import { cn } from '@/shared/lib'
import type { EntryDraft, FormErrors, SetField } from '../model/types'
import { useExerciseHint } from '../model/useExerciseHint'
import { ExerciseHint } from './ExerciseHint'
import { NoteField } from './NoteField'
import { SET_GRID, SetRow } from './SetRow'

type ExerciseEntryCardProps = {
  index: number
  entry: EntryDraft
  /** Workout date and id (when editing): the hint looks only at earlier, other workouts. */
  date: string
  workoutId?: string
  errors: FormErrors
  exerciseOptions: string[]
  canRemove: boolean
  onNameChange: (name: string) => void
  onNoteChange: (note: string) => void
  onRemove: () => void
  onAddSet: () => void
  onRemoveSet: (setKey: string) => void
  onSetChange: (setKey: string, field: SetField, value: string) => void
}

export const ExerciseEntryCard = ({
  index,
  entry,
  date,
  workoutId,
  errors,
  exerciseOptions,
  canRemove,
  onNameChange,
  onNoteChange,
  onRemove,
  onAddSet,
  onRemoveSet,
  onSetChange,
}: ExerciseEntryCardProps) => {
  const path = `entries.${index}`
  const nameError = errors[`${path}.name`]
  const setsError = errors[`${path}.sets`]
  const hint = useExerciseHint({ name: entry.name, sets: entry.sets, date, workoutId })

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Combobox
            options={exerciseOptions}
            normalize={normalizeExerciseName}
            placeholder="Упражнение, например «Подтягивания»"
            aria-label={`Упражнение ${index + 1}`}
            value={entry.name}
            invalid={Boolean(nameError)}
            emptyMessage={
              entry.name.trim()
                ? `«${entry.name.trim()}» — новое упражнение, сохранится вместе с тренировкой`
                : 'Сохранённых упражнений пока нет — введите название'
            }
            onChange={onNameChange}
          />
          {nameError && <p className="text-sm text-danger">{nameError}</p>}
        </div>
        {canRemove && (
          <Button variant="danger" aria-label={`Удалить упражнение ${index + 1}`} onClick={onRemove}>
            ✕
          </Button>
        )}
      </div>

      {hint && <ExerciseHint hint={hint} />}

      <div className={cn('grid gap-2 text-xs font-medium uppercase text-text-muted', SET_GRID)}>
        <span className="text-center">#</span>
        <span>Вес, кг</span>
        <span>Повторы</span>
        <span className="text-center" title="Повторов в запасе (reps in reserve)">
          RIR
        </span>
      </div>

      <ol className="flex flex-col gap-2">
        {entry.sets.map((set, setIndex) => (
          <SetRow
            key={set.key}
            index={setIndex}
            set={set}
            weightError={errors[`${path}.sets.${setIndex}.weight`]}
            repsError={errors[`${path}.sets.${setIndex}.reps`]}
            rirError={errors[`${path}.sets.${setIndex}.rir`]}
            canRemove={entry.sets.length > 1}
            onChange={(field, value) => onSetChange(set.key, field, value)}
            onRemove={() => onRemoveSet(set.key)}
          />
        ))}
      </ol>
      {setsError && <p className="text-sm text-danger">{setsError}</p>}

      <Button variant="secondary" className="bg-surface-raised" onClick={onAddSet}>
        + Подход
      </Button>

      <NoteField
        label="Заметка к упражнению"
        placeholder="Например: сиденье на 4, в следующий раз 82,5"
        value={entry.note}
        error={errors[`${path}.note`]}
        onChange={onNoteChange}
      />
    </section>
  )
}

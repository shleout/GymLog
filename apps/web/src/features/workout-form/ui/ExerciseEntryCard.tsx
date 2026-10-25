import { normalizeExerciseName } from '@/entities/exercise'
import { Button, Combobox } from '@/shared/ui'
import type { EntryDraft, FormErrors } from '../model/types'
import { SetRow } from './SetRow'

type ExerciseEntryCardProps = {
  index: number
  entry: EntryDraft
  errors: FormErrors
  exerciseOptions: string[]
  canRemove: boolean
  onNameChange: (name: string) => void
  onRemove: () => void
  onAddSet: () => void
  onRemoveSet: (setKey: string) => void
  onSetChange: (setKey: string, field: 'weight' | 'reps', value: string) => void
}

export const ExerciseEntryCard = ({
  index,
  entry,
  errors,
  exerciseOptions,
  canRemove,
  onNameChange,
  onRemove,
  onAddSet,
  onRemoveSet,
  onSetChange,
}: ExerciseEntryCardProps) => {
  const path = `entries.${index}`
  const nameError = errors[`${path}.name`]
  const setsError = errors[`${path}.sets`]

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

      <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem] gap-2 text-xs font-medium uppercase text-text-muted">
        <span className="text-center">#</span>
        <span>Вес, кг</span>
        <span>Повторы</span>
      </div>

      <ol className="flex flex-col gap-2">
        {entry.sets.map((set, setIndex) => (
          <SetRow
            key={set.key}
            index={setIndex}
            set={set}
            weightError={errors[`${path}.sets.${setIndex}.weight`]}
            repsError={errors[`${path}.sets.${setIndex}.reps`]}
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
    </section>
  )
}

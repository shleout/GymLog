import { useId, useState, type FormEvent } from 'react'
import { useExerciseStore, validateExerciseName, type ExerciseKind } from '@/entities/exercise'
import { Button, Input, SegmentedControl } from '@/shared/ui'

const KIND_OPTIONS: { value: ExerciseKind; label: string }[] = [
  { value: 'reps', label: 'Повторы' },
  { value: 'time', label: 'Время' },
]

export const AddExerciseForm = () => {
  const ensureExercise = useExerciseStore((state) => state.ensureExercise)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<ExerciseKind>('reps')
  const [error, setError] = useState<string>()
  const inputId = useId()
  const errorId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validateExerciseName(useExerciseStore.getState().exercises, name)
    if (message) {
      setError(message)
      return
    }
    // A previously deleted exercise with this name comes back with its history.
    ensureExercise(name, kind)
    setName('')
    setError(undefined)
  }

  return (
    <form noValidate className="flex flex-col gap-1" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
        Новое упражнение
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Например, жим лёжа"
          value={name}
          invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setName(event.target.value)
            setError(undefined)
          }}
        />
        <Button type="submit">Добавить</Button>
      </div>
      <SegmentedControl
        aria-label="Тип упражнения"
        className="mt-1"
        options={KIND_OPTIONS}
        value={kind}
        onChange={setKind}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  )
}

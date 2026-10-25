import { useId, useState, type FormEvent } from 'react'
import { useExerciseStore, validateExerciseName, type Exercise } from '@/entities/exercise'
import { Button, Input } from '@/shared/ui'

type RenameExerciseFormProps = {
  exercise: Exercise
  onDone: () => void
}

export const RenameExerciseForm = ({ exercise, onDone }: RenameExerciseFormProps) => {
  const renameExercise = useExerciseStore((state) => state.renameExercise)
  const [name, setName] = useState(exercise.name)
  const [error, setError] = useState<string>()
  const inputId = useId()
  const errorId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = validateExerciseName(useExerciseStore.getState().exercises, name, exercise.id)
    if (message) {
      setError(message)
      return
    }
    renameExercise(exercise.id, name)
    onDone()
  }

  return (
    <form noValidate className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          Название
        </label>
        <Input
          id={inputId}
          autoComplete="off"
          autoFocus
          value={name}
          invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setName(event.target.value)
            setError(undefined)
          }}
        />
        {error && (
          <p id={errorId} className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onDone}>
          Отмена
        </Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  )
}

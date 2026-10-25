import { useId, useState, type FormEvent } from 'react'
import { useExerciseStore, validateExerciseName } from '@/entities/exercise'
import { Button, Input } from '@/shared/ui'

export const AddExerciseForm = () => {
  const ensureExercise = useExerciseStore((state) => state.ensureExercise)
  const [name, setName] = useState('')
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
    ensureExercise(name)
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
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  )
}

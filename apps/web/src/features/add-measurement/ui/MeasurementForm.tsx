import { useId, type FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { useMeasurementForm } from '../model/useMeasurementForm'
import { PreviousValue } from './PreviousValue'
import { ValueInput } from './ValueInput'

type MeasurementFormProps = {
  onSuccess: () => void
}

export const MeasurementForm = ({ onSuccess }: MeasurementFormProps) => {
  const form = useMeasurementForm()
  const dateId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.submit()) onSuccess()
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

      <section className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
        <div className="grid grid-cols-2 gap-3 text-xs font-medium uppercase text-text-muted">
          <span>Сейчас</span>
          <span>Прошлый замер</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-semibold">Вес</span>
          <div className="grid grid-cols-2 items-center gap-3">
            <ValueInput
              unit="кг"
              aria-label="Вес"
              value={form.draft.weight}
              invalid={Boolean(form.errors.weight)}
              onChange={form.setWeight}
            />
            <PreviousValue previous={form.previousWeight} unit="кг" />
          </div>
          {form.errors.weight && <p className="text-sm text-danger">{form.errors.weight}</p>}
        </div>

        {form.draft.parts.map((part, index) => {
          const nameError = form.errors[`parts.${index}.name`]
          const valueError = form.errors[`parts.${index}.value`]
          return (
            <div key={part.key} className="flex flex-col gap-1 border-t border-border pt-3">
              {part.known ? (
                <span className="font-semibold">{part.name}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Часть тела, например «Талия»"
                    aria-label={`Название замера ${index + 1}`}
                    autoComplete="off"
                    value={part.name}
                    invalid={Boolean(nameError)}
                    onChange={(event) => form.updatePart(part.key, { name: event.target.value })}
                  />
                  <Button
                    variant="ghost"
                    aria-label={`Удалить замер ${index + 1}`}
                    className="px-0"
                    onClick={() => form.removePart(part.key)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 items-center gap-3">
                <ValueInput
                  unit="см"
                  aria-label={part.name ? `${part.name}, см` : `Замер ${index + 1}, см`}
                  value={part.value}
                  invalid={Boolean(valueError)}
                  onChange={(value) => form.updatePart(part.key, { value })}
                />
                {part.known ? <PreviousValue previous={part.previous} unit="см" /> : <span />}
              </div>
              {(nameError || valueError) && (
                <p className="text-sm text-danger">{nameError ?? valueError}</p>
              )}
            </div>
          )
        })}

        <Button variant="secondary" className="bg-white" onClick={form.addPart}>
          + Другой замер
        </Button>
      </section>

      <p className="text-sm text-text-muted">
        Пустые поля не сохраняются — заполните только то, что замеряли.
      </p>
      {form.errors.form && <p className="text-sm text-danger">{form.errors.form}</p>}

      <Button type="submit" className="mt-2 min-h-14 text-lg">
        Сохранить замеры
      </Button>
    </form>
  )
}

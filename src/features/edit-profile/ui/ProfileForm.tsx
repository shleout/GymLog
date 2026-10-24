import { useId, type FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { useProfileForm } from '../model/useProfileForm'

type ProfileFormProps = {
  onSuccess: () => void
}

export const ProfileForm = ({ onSuccess }: ProfileFormProps) => {
  const form = useProfileForm()
  const nicknameId = useId()
  const heightId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.submit()) onSuccess()
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor={nicknameId} className="text-sm font-medium text-text-muted">
          Никнейм
        </label>
        <Input
          id={nicknameId}
          autoComplete="nickname"
          placeholder="Как к вам обращаться"
          value={form.draft.nickname}
          invalid={Boolean(form.errors.nickname)}
          onChange={(event) => form.setField('nickname', event.target.value)}
        />
        {form.errors.nickname && <p className="text-sm text-danger">{form.errors.nickname}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={heightId} className="text-sm font-medium text-text-muted">
          Рост, см
        </label>
        <Input
          id={heightId}
          inputMode="decimal"
          placeholder="Например, 180"
          value={form.draft.height}
          invalid={Boolean(form.errors.height)}
          onChange={(event) => form.setField('height', event.target.value)}
        />
        {form.errors.height && <p className="text-sm text-danger">{form.errors.height}</p>}
      </div>

      <p className="text-sm text-text-muted">
        Вес записывается вместе с замерами — так сохраняется его история.
      </p>

      <Button type="submit" className="mt-2 min-h-14 text-lg">
        Сохранить
      </Button>
    </form>
  )
}

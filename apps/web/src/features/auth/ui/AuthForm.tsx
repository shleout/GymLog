import { useId, type FormEvent } from 'react'
import { Button, Input, PasswordInput } from '@/shared/ui'
import { useAuthForm, type AuthMode } from '../model/useAuthForm'

type AuthFormProps = {
  mode: AuthMode
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const form = useAuthForm(mode)
  const emailId = useId()
  const passwordId = useId()
  const passwordConfirmId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.submit()
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor={emailId} className="text-sm font-medium text-text-muted">
          Email
        </label>
        <Input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.draft.email}
          invalid={Boolean(form.errors.email)}
          onChange={(event) => form.setField('email', event.target.value)}
        />
        {form.errors.email && <p className="text-sm text-danger">{form.errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={passwordId} className="text-sm font-medium text-text-muted">
          Пароль
        </label>
        <PasswordInput
          id={passwordId}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={form.draft.password}
          invalid={Boolean(form.errors.password)}
          onChange={(event) => form.setField('password', event.target.value)}
        />
        {form.errors.password && <p className="text-sm text-danger">{form.errors.password}</p>}
      </div>

      {mode === 'register' && (
        <div className="flex flex-col gap-1">
          <label htmlFor={passwordConfirmId} className="text-sm font-medium text-text-muted">
            Повторите пароль
          </label>
          <PasswordInput
            id={passwordConfirmId}
            autoComplete="new-password"
            value={form.draft.passwordConfirm}
            invalid={Boolean(form.errors.passwordConfirm)}
            onChange={(event) => form.setField('passwordConfirm', event.target.value)}
          />
          {form.errors.passwordConfirm && (
            <p className="text-sm text-danger">{form.errors.passwordConfirm}</p>
          )}
        </div>
      )}

      {form.errors.form && (
        <p role="alert" className="text-sm text-danger">
          {form.errors.form}
        </p>
      )}

      <Button type="submit" disabled={form.pending} className="mt-2 min-h-14 text-lg">
        {form.pending ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
      </Button>

      {form.slow && (
        <p className="text-center text-sm text-text-muted">
          Сервер просыпается — первый запрос может занять до минуты.
        </p>
      )}
    </form>
  )
}

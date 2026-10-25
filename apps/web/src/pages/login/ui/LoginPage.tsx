import { useState } from 'react'
import { AuthForm, type AuthMode } from '@/features/auth'
import { cn } from '@/shared/lib'

const MODES: { mode: AuthMode; label: string }[] = [
  { mode: 'login', label: 'Вход' },
  { mode: 'register', label: 'Регистрация' },
]

export const LoginPage = () => {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-8 px-4 py-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-bold">GymLog</h1>
        <p className="text-text-muted">Дневник тренировок и замеров</p>
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
        {MODES.map((item) => (
          <button
            key={item.mode}
            type="button"
            aria-pressed={mode === item.mode}
            className={cn(
              'min-h-11 rounded-lg font-semibold text-text-muted transition-colors',
              mode === item.mode && 'bg-surface-raised text-text shadow-sm',
            )}
            onClick={() => setMode(item.mode)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AuthForm mode={mode} />
    </main>
  )
}

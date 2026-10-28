import { useState } from 'react'
import { logout, useCurrentUser } from '@/entities/session'
import { Button } from '@/shared/ui'
import { useForeignDataOwner } from '../model/foreignData'
import { adoptLocalData, discardLocalData } from '../model/localData'

/**
 * Shown instead of the app when the device holds another account's data: uploading it into
 * the current account or wiping it are both irreversible, so neither happens silently.
 */
export const ForeignDataPrompt = () => {
  const user = useCurrentUser()
  const ownerEmail = useForeignDataOwner()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  if (!user || !ownerEmail) return null

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">На устройстве чужие данные</h1>
        <p className="text-text-muted">
          Здесь сохранены тренировки и замеры аккаунта{' '}
          <span className="break-all font-semibold text-text">{ownerEmail}</span>. Вы вошли как{' '}
          <span className="break-all font-semibold text-text">{user.email}</span>.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <Button className="min-h-14 text-lg" onClick={() => adoptLocalData(user)}>
          Загрузить в мой аккаунт
        </Button>

        {confirmingDelete ? (
          <div
            role="alertdialog"
            aria-label="Удалить данные с устройства?"
            className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4"
          >
            <p className="font-semibold">
              Удалить данные с устройства? Если они не были синхронизированы с {ownerEmail}, они
              пропадут.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" autoFocus onClick={() => setConfirmingDelete(false)}>
                Отмена
              </Button>
              <Button
                className="bg-danger-strong text-white hover:bg-danger-strong/90"
                onClick={() => discardLocalData(user)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Удалить с устройства и загрузить мои данные
          </Button>
        )}

        <Button variant="ghost" onClick={() => void logout()}>
          Выйти — это не мой аккаунт
        </Button>
      </div>
    </main>
  )
}

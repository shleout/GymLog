import { useState } from 'react'
import { logout, useCurrentUser } from '@/entities/session'
import { clearLocalData, SyncStatus, usePendingCount } from '@/features/sync'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

type AccountPanelProps = {
  className?: string
}

/** Signed-in email, sync status and sign-out with a choice of what happens to local data. */
export const AccountPanel = ({ className }: AccountPanelProps) => {
  const user = useCurrentUser()
  const pending = usePendingCount()
  const [confirming, setConfirming] = useState(false)

  const signOut = async (keepData: boolean) => {
    await logout()
    // After the session ends, so the sync loop can't push the records being removed.
    if (!keepData) clearLocalData()
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="break-all text-text-muted">{user?.email}</p>
      <SyncStatus />

      {confirming ? (
        <div
          role="alertdialog"
          aria-label="Выйти из аккаунта?"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted p-4"
        >
          <p className="font-semibold">Что сделать с данными на этом устройстве?</p>
          {pending > 0 && (
            <p className="text-sm text-danger">
              Не отправлено изменений: {pending}. Если удалить данные, эти изменения пропадут.
            </p>
          )}
          <Button autoFocus onClick={() => void signOut(true)}>
            Оставить и выйти
          </Button>
          <Button
            className="bg-danger-strong text-white hover:bg-danger-strong/90"
            onClick={() => void signOut(false)}
          >
            Удалить и выйти
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Отмена
          </Button>
        </div>
      ) : (
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Выйти из аккаунта
        </Button>
      )}
    </div>
  )
}

import { format, isToday, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useSyncStore } from '@/entities/sync'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { requestSync } from '../model/syncEngine'
import { usePendingCount } from '../model/usePendingCount'

const formatSyncedAt = (iso: string): string => {
  const date = parseISO(iso)
  return format(date, isToday(date) ? 'HH:mm' : 'd MMM, HH:mm', { locale: ru })
}

export const SyncStatus = () => {
  const status = useSyncStore((state) => state.status)
  const error = useSyncStore((state) => state.error)
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const pending = usePendingCount()

  const title =
    status === 'syncing'
      ? 'Синхронизация…'
      : status === 'offline'
        ? 'Нет связи с сервером'
        : status === 'error'
          ? 'Ошибка синхронизации'
          : lastSyncedAt
            ? `Синхронизировано в ${formatSyncedAt(lastSyncedAt)}`
            : 'Ещё не синхронизировано'

  const details =
    status === 'error' && error
      ? error
      : pending > 0
        ? `Не отправлено изменений: ${pending}${status === 'offline' ? ' — отправятся, когда появится связь' : ''}`
        : 'Все изменения на сервере'

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col" aria-live="polite">
        <p className={cn('font-semibold', status === 'error' && 'text-danger')}>{title}</p>
        <p className="text-sm text-text-muted">{details}</p>
      </div>
      <Button variant="secondary" disabled={status === 'syncing'} onClick={requestSync}>
        Обновить
      </Button>
    </div>
  )
}

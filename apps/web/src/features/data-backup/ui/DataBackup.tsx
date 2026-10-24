import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/shared/ui'
import {
  createBackup,
  downloadBackup,
  getBackupSummary,
  parseBackupFile,
  restoreBackup,
} from '../model/backup'
import type { Backup } from '../model/backupSchema'

type Status = { type: 'success' | 'error'; message: string } | null

export const DataBackup = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)
  const [status, setStatus] = useState<Status>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset so that choosing the same file again still fires `change`.
    event.target.value = ''
    if (!file) return

    const result = await parseBackupFile(file)
    if (result.ok) {
      setPending(result.backup)
      setStatus(null)
    } else {
      setPending(null)
      setStatus({ type: 'error', message: result.error })
    }
  }

  const confirmImport = () => {
    if (!pending) return
    restoreBackup(pending)
    setPending(null)
    setStatus({ type: 'success', message: 'Данные восстановлены из файла' })
  }

  const summary = pending ? getBackupSummary(pending) : null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Пока данные хранятся только на этом устройстве. Сохраните резервную копию в файл, чтобы не
        потерять их или перенести на другое устройство.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            downloadBackup(createBackup())
            setStatus(null)
          }}
        >
          Экспорт
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Импорт
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {pending && summary && (
        <div
          role="alertdialog"
          aria-label="Подтверждение импорта"
          className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4"
        >
          <p className="font-semibold">Заменить все данные на этом устройстве?</p>
          <p className="text-sm text-text-muted">
            Копия от {format(parseISO(pending.exportedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}:
            тренировок — {summary.workouts}, сессий замеров — {summary.measurements}. Текущие данные
            будут удалены.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" autoFocus onClick={() => setPending(null)}>
              Отмена
            </Button>
            <Button className="bg-danger text-white hover:bg-danger/90" onClick={confirmImport}>
              Заменить
            </Button>
          </div>
        </div>
      )}

      {status && (
        <p
          role="status"
          className={status.type === 'error' ? 'text-sm text-danger' : 'text-sm text-text-muted'}
        >
          {status.message}
        </p>
      )}
    </div>
  )
}

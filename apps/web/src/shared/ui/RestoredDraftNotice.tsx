import { format, isToday, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'
import { Button } from './Button'

type RestoredDraftNoticeProps = {
  savedAt: string
  /** Shown above the actions, e.g. when the record changed on another device meanwhile. */
  warning?: string
  onDiscard: () => void
}

const formatSavedAt = (iso: string): string => {
  const date = parseISO(iso)
  return format(date, isToday(date) ? 'HH:mm' : 'd MMMM, HH:mm', { locale: ru })
}

/** The form opened with an unfinished draft; starting over takes two taps, like other destructive actions. */
export const RestoredDraftNotice = ({ savedAt, warning, onDiscard }: RestoredDraftNoticeProps) => {
  const [confirming, setConfirming] = useState(false)

  return (
    <div role="status" className="flex flex-col gap-3 rounded-2xl bg-primary/10 p-4">
      <p className="font-semibold">Восстановлен черновик от {formatSavedAt(savedAt)}</p>
      {warning && <p className="text-sm text-danger">{warning}</p>}
      {confirming ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" autoFocus onClick={() => setConfirming(false)}>
            Оставить
          </Button>
          <Button className="bg-danger text-white hover:bg-danger/90" onClick={onDiscard}>
            Сбросить
          </Button>
        </div>
      ) : (
        <Button variant="secondary" className="self-start" onClick={() => setConfirming(true)}>
          Начать заново
        </Button>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Button } from './Button'

type ConfirmActionProps = {
  /** Label of the initial (danger) button. */
  label: string
  question: string
  confirmLabel: string
  onConfirm: () => void
}

/** Two-step destructive action: the first tap asks for confirmation instead of a modal. */
export const ConfirmAction = ({ label, question, confirmLabel, onConfirm }: ConfirmActionProps) => {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        {label}
      </Button>
    )
  }

  return (
    <div
      role="alertdialog"
      aria-label={question}
      className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4"
    >
      <p className="font-semibold">{question}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" autoFocus onClick={() => setConfirming(false)}>
          Отмена
        </Button>
        <Button className="bg-danger-strong text-white hover:bg-danger-strong/90" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}

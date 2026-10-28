import { useId, useState } from 'react'
import { NOTE_MAX_LENGTH } from '@/entities/workout'
import { Button, Textarea } from '@/shared/ui'

type NoteFieldProps = {
  label: string
  placeholder: string
  value: string
  error?: string
  onChange: (value: string) => void
  className?: string
}

/** Collapsed to a button until used: most workouts have no notes, the form stays short. */
export const NoteField = ({ label, placeholder, value, error, onChange, className }: NoteFieldProps) => {
  const [open, setOpen] = useState(value !== '')
  const id = useId()

  if (!open) {
    return (
      <Button variant="ghost" className={className} onClick={() => setOpen(true)}>
        + {label}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      <Textarea
        id={id}
        // Opened by the button: the user is about to type.
        autoFocus={value === ''}
        placeholder={placeholder}
        maxLength={NOTE_MAX_LENGTH}
        value={value}
        invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}

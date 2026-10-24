import { Button, Input } from '@/shared/ui'
import type { SetDraft } from '../model/types'

type SetRowProps = {
  index: number
  set: SetDraft
  weightError?: string
  repsError?: string
  canRemove: boolean
  onChange: (field: 'weight' | 'reps', value: string) => void
  onRemove: () => void
}

export const SetRow = ({
  index,
  set,
  weightError,
  repsError,
  canRemove,
  onChange,
  onRemove,
}: SetRowProps) => (
  <li className="flex flex-col gap-1">
    <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem] items-center gap-2">
      <span className="text-center font-semibold text-text-muted">{index + 1}</span>
      <Input
        inputMode="decimal"
        placeholder="—"
        aria-label={`Вес, подход ${index + 1}`}
        value={set.weight}
        invalid={Boolean(weightError)}
        onChange={(event) => onChange('weight', event.target.value)}
      />
      <Input
        inputMode="numeric"
        placeholder="0"
        aria-label={`Повторения, подход ${index + 1}`}
        value={set.reps}
        invalid={Boolean(repsError)}
        onChange={(event) => onChange('reps', event.target.value)}
      />
      {canRemove ? (
        <Button variant="ghost" aria-label={`Удалить подход ${index + 1}`} className="px-0" onClick={onRemove}>
          ✕
        </Button>
      ) : (
        <span />
      )}
    </div>
    {(weightError || repsError) && (
      <p className="pl-10 text-sm text-danger">{weightError ?? repsError}</p>
    )}
  </li>
)

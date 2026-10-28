import { cn } from '@/shared/lib'
import { Button, Input } from '@/shared/ui'
import type { SetDraft, SetField } from '../model/types'

/** Columns: #, weight, reps, RIR, remove. Shared with the header row in ExerciseEntryCard. */
export const SET_GRID = 'grid-cols-[2rem_1fr_1fr_3rem_2.75rem]'

type SetRowProps = {
  index: number
  set: SetDraft
  weightError?: string
  repsError?: string
  rirError?: string
  canRemove: boolean
  onChange: (field: SetField, value: string) => void
  onRemove: () => void
}

export const SetRow = ({
  index,
  set,
  weightError,
  repsError,
  rirError,
  canRemove,
  onChange,
  onRemove,
}: SetRowProps) => (
  <li className="flex flex-col gap-1">
    <div className={cn('grid items-center gap-2', SET_GRID)}>
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
      <Input
        inputMode="numeric"
        placeholder="—"
        aria-label={`RIR, подход ${index + 1}`}
        className="px-1 text-center"
        value={set.rir}
        invalid={Boolean(rirError)}
        onChange={(event) => onChange('rir', event.target.value)}
      />
      {canRemove ? (
        <Button variant="ghost" aria-label={`Удалить подход ${index + 1}`} className="px-0" onClick={onRemove}>
          ✕
        </Button>
      ) : (
        <span />
      )}
    </div>
    {(weightError || repsError || rirError) && (
      <p className="pl-10 text-sm text-danger">
        {weightError ?? repsError ?? (rirError && `RIR: ${rirError}`)}
      </p>
    )}
  </li>
)

import { Input } from '@/shared/ui'

type ValueInputProps = {
  value: string
  unit: string
  invalid: boolean
  'aria-label': string
  onChange: (value: string) => void
}

export const ValueInput = ({ value, unit, invalid, 'aria-label': ariaLabel, onChange }: ValueInputProps) => (
  <div className="relative">
    <Input
      inputMode="decimal"
      placeholder="0"
      aria-label={ariaLabel}
      value={value}
      invalid={invalid}
      className="pr-11"
      onChange={(event) => onChange(event.target.value)}
    />
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted">
      {unit}
    </span>
  </div>
)

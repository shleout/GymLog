import { cn } from '../lib'

type SegmentedControlOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  'aria-label': string
  className?: string
}

/** Switches between sections of one screen (not a second tab bar). */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
}: SegmentedControlProps<T>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className={cn('flex gap-1 rounded-2xl bg-surface-muted p-1', className)}
  >
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={option.value === value}
        className={cn(
          'min-h-11 flex-1 rounded-xl px-2 text-sm font-semibold transition-colors',
          'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
          option.value === value
            ? 'bg-surface-raised text-text'
            : 'text-text-muted hover:text-text',
        )}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
)

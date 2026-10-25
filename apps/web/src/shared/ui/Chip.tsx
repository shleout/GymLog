import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib'

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> & {
  active: boolean
}

/** Toggle button for filters: single choice (period) or several at once (chart series). */
export const Chip = ({ active, className, type = 'button', ...props }: ChipProps) => (
  <button
    type={type}
    aria-pressed={active}
    className={cn(
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      active
        ? 'border-transparent bg-surface-raised text-text'
        : 'border-border bg-transparent text-text-muted hover:text-text',
      className,
    )}
    {...props}
  />
)

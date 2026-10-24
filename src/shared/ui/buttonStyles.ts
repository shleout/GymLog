import { cn } from '../lib'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-surface-muted text-text hover:bg-surface-muted/70',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-muted',
  danger: 'bg-transparent text-danger hover:bg-danger/10',
}

/** Shared button styles, also usable on links (e.g. react-router `Link`). */
export const buttonStyles = (variant: ButtonVariant = 'primary', className?: string): string =>
  cn(
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    className,
  )

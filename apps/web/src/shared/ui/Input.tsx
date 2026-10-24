import type { InputHTMLAttributes } from 'react'
import { cn } from '../lib'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export const Input = ({ invalid = false, className, ...props }: InputProps) => (
  <input
    aria-invalid={invalid || undefined}
    className={cn(
      'min-h-11 w-full rounded-xl border border-border bg-white px-3 text-base text-text',
      'placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
      invalid && 'border-danger focus:border-danger focus:ring-danger/30',
      className,
    )}
    {...props}
  />
)

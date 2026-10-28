import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../lib'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

/**
 * Multi-line `Input`; grows with the text where `field-sizing` is supported.
 * `field-sizing: content` ignores `rows`, so the two-line minimum is set by `min-h-18`
 * (2 × 24px line + 20px padding + 2px border).
 */
export const Textarea = ({ invalid = false, rows = 2, className, ...props }: TextareaProps) => (
  <textarea
    aria-invalid={invalid || undefined}
    rows={rows}
    className={cn(
      'field-sizing-content max-h-48 min-h-18 w-full resize-none rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-base text-text',
      'placeholder:text-text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
      invalid && 'border-danger focus:border-danger focus:ring-danger/30',
      className,
    )}
    {...props}
  />
)

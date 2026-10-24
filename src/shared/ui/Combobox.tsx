import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '../lib'
import { Input } from './Input'

type ComboboxProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
  /** Key used to match the typed text against options. Defaults to trimmed lowercase. */
  normalize?: (value: string) => string
  /** Shown in the popup when no option matches. */
  emptyMessage?: ReactNode
  placeholder?: string
  invalid?: boolean
  'aria-label'?: string
  className?: string
}

const defaultNormalize = (value: string): string => value.trim().toLowerCase()

/**
 * Text input with a filterable suggestion list. Free text is allowed:
 * options only help to pick a previously used value.
 */
export const Combobox = ({
  value,
  onChange,
  options,
  normalize = defaultNormalize,
  emptyMessage,
  placeholder,
  invalid,
  'aria-label': ariaLabel,
  className,
}: ComboboxProps) => {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  // Opened via the toggle button: show every option, not only the ones matching the text.
  const [showAll, setShowAll] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const query = normalize(value)
  const visibleOptions =
    showAll || query === '' ? options : options.filter((option) => normalize(option).includes(query))
  const hasActive = activeIndex >= 0 && activeIndex < visibleOptions.length
  const showPopup = open && (visibleOptions.length > 0 || emptyMessage !== undefined)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!hasActive) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, hasActive])

  const openList = (all: boolean) => {
    setShowAll(all)
    setActiveIndex(-1)
    setOpen(true)
  }

  const select = (option: string) => {
    onChange(option)
    setOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) return openList(false)
        setActiveIndex((index) => (index + 1 >= visibleOptions.length ? 0 : index + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) return
        setActiveIndex((index) => (index <= 0 ? visibleOptions.length - 1 : index - 1))
        break
      case 'Enter':
        if (open && hasActive) {
          event.preventDefault()
          select(visibleOptions[activeIndex])
        }
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        break
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Input
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={showPopup}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={hasActive ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        invalid={invalid}
        value={value}
        className="pr-12"
        onChange={(event) => {
          onChange(event.target.value)
          openList(false)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setOpen(false)}
      />

      {/* Wide touch target over the right part of the input. Mouse down is prevented
          so the input keeps (or does not get) focus: on a phone the list opens without the keyboard. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label={showPopup ? 'Скрыть список' : 'Показать список'}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-text-muted transition-colors hover:text-text active:bg-surface-muted/60"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => (showPopup ? setOpen(false) : openList(true))}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn('size-5 transition-transform duration-200', showPopup && 'rotate-180')}
        >
          <path d="m5 8 5 5 5-5" />
        </svg>
      </button>

      {showPopup && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-white shadow-lg shadow-text/10">
          {visibleOptions.length > 0 ? (
            // At most 5 options are visible (option height 2.75rem + py-1), the rest scroll.
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              className="max-h-[calc(5*2.75rem+0.5rem)] overflow-y-auto overscroll-contain py-1"
            >
              {visibleOptions.map((option, index) => {
                const selected = normalize(option) === query
                return (
                  <li
                    key={option}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={selected}
                    className={cn(
                      'flex h-11 shrink-0 cursor-pointer items-center justify-between gap-2 px-3 text-base',
                      index === activeIndex && 'bg-primary/10',
                      selected && 'font-semibold text-primary',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(option)}
                  >
                    <span className="truncate">{option}</span>
                    {selected && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="size-5 shrink-0"
                      >
                        <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                      </svg>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p id={listId} className="px-3 py-3 text-sm text-text-muted">
              {emptyMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

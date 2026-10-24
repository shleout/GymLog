import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { loadState, removeState, saveState } from './storage'

const DRAFT_PREFIX = 'gymlog-draft:'
/** Short enough to feel instant, long enough not to write on every keystroke. */
const SAVE_DELAY_MS = 300

export type DraftInfo = {
  /** When the draft was last saved, ISO. */
  savedAt: string
  /** `updatedAt` of the edited record when editing started; `null` for new records. */
  base: string | null
}

const draftEnvelope = <T>(schema: z.ZodType<T>) =>
  z.object({ savedAt: z.string(), base: z.string().nullable(), data: schema })

/**
 * Is there an unfinished draft under this key. Shape is not validated here: a draft that fails
 * validation is backed up to `:corrupted` when the form opens, and the badge disappears then.
 */
export const hasDraft = (key: string): boolean => {
  try {
    return localStorage.getItem(DRAFT_PREFIX + key) !== null
  } catch {
    return false
  }
}

type PersistentDraftOptions<T> = {
  /** Storage key of this form instance, e.g. `workout:new` or `workout:<id>`. */
  key: string
  /** Validates the stored draft; a draft of an older shape goes to `:corrupted`, not lost silently. */
  schema: z.ZodType<T>
  /** Fresh draft when nothing is stored. */
  create: () => T
  /** `updatedAt` of the record being edited, saved with the draft to detect remote changes. */
  base?: string | null
}

/**
 * Form draft that survives a reload: the phone unloading the PWA in the background, an
 * accidental pull-to-refresh, a crashed tab. Saved to localStorage shortly after each change
 * and immediately when the page is hidden — iOS may kill a backgrounded PWA without warning.
 * An untouched fresh draft is not saved, so merely opening a form leaves no draft behind.
 */
export const usePersistentDraft = <T>({ key, schema, create, base = null }: PersistentDraftOptions<T>) => {
  const storageKey = DRAFT_PREFIX + key
  const [stored] = useState(() => loadState(storageKey, draftEnvelope(schema)))
  const [restored, setRestored] = useState<DraftInfo | null>(
    stored && { savedAt: stored.savedAt, base: stored.base },
  )
  const [draft, setDraft] = useState<T>(() => stored?.data ?? create())

  // Refs, not state: the save scheduling must not re-render the form.
  /** Draft as opened (fresh or restored): saved only once the user changes something. */
  const pristine = useRef<T>(draft)
  const baseRef = useRef(restored?.base ?? base)
  const latest = useRef(draft)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dirty = useRef(false)
  const cleared = useRef(false)

  useEffect(() => {
    const flush = () => {
      clearTimeout(timer.current)
      if (!dirty.current || cleared.current) return
      dirty.current = false
      saveState(storageKey, { savedAt: new Date().toISOString(), base: baseRef.current, data: latest.current })
    }
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('pagehide', flush)
      flush() // leaving the form (e.g. "←") within the save delay must not lose the last edit
    }
  }, [storageKey])

  useEffect(() => {
    latest.current = draft
    if (draft === pristine.current || cleared.current) return
    dirty.current = true
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      dirty.current = false
      saveState(storageKey, { savedAt: new Date().toISOString(), base: baseRef.current, data: draft })
    }, SAVE_DELAY_MS)
  }, [draft, storageKey])

  /** The data was saved for real: drop the draft and stop autosaving. */
  const clear = () => {
    clearTimeout(timer.current)
    cleared.current = true
    removeState(storageKey)
  }

  /** "Start over": a fresh draft replaces the stored one. */
  const discard = () => {
    clearTimeout(timer.current)
    dirty.current = false
    removeState(storageKey)
    const fresh = create()
    pristine.current = fresh
    baseRef.current = base
    setDraft(fresh)
    setRestored(null)
  }

  return {
    draft,
    setDraft,
    /** Set when the form opened with a stored draft. */
    restored,
    clear,
    discard,
  }
}

export type { AdminUserData, AdminUserSummary } from '@gymlog/schemas'

/** Server data loaded on demand. `data` survives a reload, so a refresh doesn't blank the screen. */
export type Resource<T> = {
  data: T | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
}

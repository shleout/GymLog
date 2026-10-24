/**
 * `crypto.randomUUID` exists only in secure contexts, so opening the dev
 * server from a phone over plain http (LAN IP) needs a fallback.
 */
export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

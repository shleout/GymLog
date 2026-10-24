const toHex = (byte: number): string => byte.toString(16).padStart(2, '0')

/**
 * UUID v4 (ids are generated offline on the client and must be valid for a `uuid` column).
 * `crypto.randomUUID` exists only in secure contexts, so opening the dev server from
 * a phone over plain http (LAN IP) falls back to `getRandomValues`, which works everywhere.
 */
export const createId = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC 4122 variant
  const hex = Array.from(bytes, toHex).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

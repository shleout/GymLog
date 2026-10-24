type Versioned = { id: string; updatedAt: string }

/** `a` is strictly later than `b`. Compared as instants: the offsets of the strings may differ. */
export const isNewer = (a: string, b: string): boolean => Date.parse(a) > Date.parse(b)

/**
 * Merges records pulled from the server into the local list, last write wins by `updatedAt`.
 * A remote record replaces the local one only when strictly newer: on equal timestamps the
 * local object is kept, so echoes of our own pushes don't re-render anything.
 */
export const mergeRemote = <T extends Versioned>(local: T[], remote: T[]): T[] => {
  if (remote.length === 0) return local
  // Pull pages are ordered by revision, so for repeated ids the Map keeps the latest version.
  const incoming = new Map(remote.map((record) => [record.id, record]))
  const merged = local.map((record) => {
    const candidate = incoming.get(record.id)
    if (!candidate) return record
    incoming.delete(record.id)
    return isNewer(candidate.updatedAt, record.updatedAt) ? candidate : record
  })
  return [...merged, ...incoming.values()]
}

/** `90` → `1:30`, `45` → `0:45`, `3725` → `62:05`. */
export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** `90` → `{ minutes: '1', seconds: '30' }`: the two fields of a duration input. */
export const splitDuration = (totalSeconds: number): { minutes: string; seconds: string } => ({
  minutes: String(Math.floor(totalSeconds / 60)),
  seconds: String(totalSeconds % 60),
})

import { useEffect, useState } from 'react'

const TICK_MS = 250

/**
 * Stopwatch for one timed set. Elapsed time is computed from the start timestamp, not from
 * counted ticks, so it stays correct when the phone sleeps or the tab is in the background.
 * `stop` returns the elapsed time rounded to whole seconds.
 */
export const useStopwatch = () => {
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (startedAt === null) return
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [startedAt])

  const running = startedAt !== null
  const elapsedSec = running ? Math.max(0, Math.round((Math.max(now, startedAt) - startedAt) / 1000)) : 0

  const start = () => {
    const time = Date.now()
    setNow(time)
    setStartedAt(time)
  }

  const stop = (): number => {
    const seconds = startedAt === null ? 0 : Math.round((Date.now() - startedAt) / 1000)
    setStartedAt(null)
    return seconds
  }

  return { running, elapsedSec, start, stop }
}

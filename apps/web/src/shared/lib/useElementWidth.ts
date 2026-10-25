import { useLayoutEffect, useRef, useState } from 'react'

/** Current width of an element in CSS pixels (0 before the first layout). */
export const useElementWidth = <T extends Element>() => {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    setWidth(element.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

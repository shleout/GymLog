import { useState } from 'react'
import { cn, useElementWidth } from '../lib'

export type ChartPoint = {
  key: string
  /** Timestamp, ms: the x axis is a time scale, so gaps between workouts stay visible. */
  x: number
  y: number
  /** Accessible name of the point, e.g. «12 окт: 35 кг». */
  label: string
}

export type ChartSeries = {
  id: string
  tone: 'primary' | 'accent'
  dashed?: boolean
  /** Sorted by x. */
  points: ChartPoint[]
}

type LineChartProps = {
  series: ChartSeries[]
  selectedKey: string | null
  onSelect: (key: string | null) => void
  formatX: (x: number) => string
  formatY: (y: number) => string
  'aria-label': string
  className?: string
}

const HEIGHT = 200
const PADDING = { top: 12, right: 16, bottom: 28, left: 40 }
const DAY_MS = 24 * 60 * 60 * 1000

const toneClasses = {
  primary: { line: 'stroke-primary', point: 'fill-primary' },
  accent: { line: 'stroke-accent', point: 'fill-accent' },
}

/** A round step (1, 2, 2.5, 5 × 10ⁿ) splitting `range` into about `count` parts. */
const getNiceStep = (range: number, count: number): number => {
  const raw = range / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

const getYTicks = (values: number[]): number[] => {
  let low = Math.min(...values)
  let high = Math.max(...values)
  if (high - low < 1) {
    const pad = Math.max(Math.abs(high) * 0.1, 1)
    low -= pad
    high += pad
  }
  const step = getNiceStep(high - low, 3)
  // Weights and reps are never negative, so the padding must not push the axis below zero.
  const start = low >= 0 ? Math.max(Math.floor(low / step), 0) : Math.floor(low / step)
  const end = Math.ceil(high / step)
  const ticks: number[] = []
  for (let index = start; index <= end; index += 1) {
    ticks.push(Math.round(index * step * 100) / 100)
  }
  return ticks
}

/** Line chart on plain SVG: a few series of tens of points don't need a chart library. */
export const LineChart = ({
  series,
  selectedKey,
  onSelect,
  formatX,
  formatY,
  'aria-label': ariaLabel,
  className,
}: LineChartProps) => {
  const [containerRef, width] = useElementWidth<HTMLDivElement>()
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const points = series.flatMap((item) => item.points)

  if (points.length === 0) return null

  const xs = points.map((point) => point.x)
  let xMin = Math.min(...xs)
  let xMax = Math.max(...xs)
  if (xMin === xMax) {
    xMin -= DAY_MS
    xMax += DAY_MS
  }
  const yTicks = getYTicks(points.map((point) => point.y))
  const yMin = yTicks[0]
  const yMax = yTicks[yTicks.length - 1]

  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 1)
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
  const scaleX = (x: number) => PADDING.left + ((x - xMin) / (xMax - xMin)) * plotWidth
  const scaleY = (y: number) => PADDING.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight

  const distinctXs = [...new Set(xs)]
  const xTicks =
    distinctXs.length === 1 ? distinctXs : [xMin, (xMin + xMax) / 2, xMax]

  const selected = points.find((point) => point.key === selectedKey)
  const hovered = points.find((point) => point.key === hoveredKey)
  const isHighlighted = (key: string) => key === selectedKey || key === hoveredKey

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      {width > 0 && (
        <svg
          role="group"
          aria-label={ariaLabel}
          width={width}
          height={HEIGHT}
          className="block touch-manipulation select-none"
          onClick={() => onSelect(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={scaleY(tick)}
                y2={scaleY(tick)}
                className="stroke-border"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={scaleY(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-text-muted text-[11px]"
              >
                {formatY(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick, index) => (
            <text
              key={tick}
              x={scaleX(tick)}
              y={HEIGHT - 8}
              textAnchor={
                xTicks.length === 1 ? 'middle' : index === 0 ? 'start' : index === xTicks.length - 1 ? 'end' : 'middle'
              }
              className="fill-text-muted text-[11px]"
            >
              {formatX(tick)}
            </text>
          ))}

          {selected && (
            <line
              x1={scaleX(selected.x)}
              x2={scaleX(selected.x)}
              y1={PADDING.top}
              y2={PADDING.top + plotHeight}
              className="stroke-text-muted"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          )}

          {series.map((item) => (
            <g key={item.id}>
              {item.points.length > 1 && (
                <polyline
                  points={item.points.map((point) => `${scaleX(point.x)},${scaleY(point.y)}`).join(' ')}
                  fill="none"
                  className={toneClasses[item.tone].line}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={item.dashed ? '6 5' : undefined}
                />
              )}
              {item.points.map((point) => (
                <circle
                  key={point.key}
                  cx={scaleX(point.x)}
                  cy={scaleY(point.y)}
                  r={isHighlighted(point.key) ? 7 : 4.5}
                  className={cn(toneClasses[item.tone].point, 'stroke-surface')}
                  strokeWidth={isHighlighted(point.key) ? 3 : 2}
                />
              ))}
            </g>
          ))}

          {hovered && (
            <text
              x={Math.min(Math.max(scaleX(hovered.x), PADDING.left + 16), width - PADDING.right - 16)}
              y={Math.max(scaleY(hovered.y) - 14, 10)}
              textAnchor="middle"
              className="pointer-events-none fill-text text-xs font-semibold"
            >
              {formatY(hovered.y)}
            </text>
          )}

          {/* Invisible 44px hit targets on top of everything, one per point. */}
          {points.map((point) => (
            <circle
              key={point.key}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={22}
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label={point.label}
              aria-pressed={point.key === selectedKey}
              className="cursor-pointer outline-none focus-visible:stroke-primary"
              strokeWidth={2}
              onPointerEnter={() => setHoveredKey(point.key)}
              onPointerLeave={() => setHoveredKey((prev) => (prev === point.key ? null : prev))}
              onFocus={() => setHoveredKey(point.key)}
              onBlur={() => setHoveredKey((prev) => (prev === point.key ? null : prev))}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(point.key === selectedKey ? null : point.key)
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onSelect(point.key === selectedKey ? null : point.key)
              }}
            />
          ))}
        </svg>
      )}
    </div>
  )
}

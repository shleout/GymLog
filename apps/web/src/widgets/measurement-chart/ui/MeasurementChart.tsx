import { format, parseISO, subMonths, subYears } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getMeasurementTracks, useMeasurements, type TrackPoint } from '@/entities/measurement'
import { paths } from '@/shared/config'
import { cn, formatDiff, formatNumber } from '@/shared/lib'
import { Chip, LineChart } from '@/shared/ui'

type MeasurementChartProps = {
  className?: string
}

type Period = '3m' | '1y' | 'all'

// Measurements are taken every few weeks, so a month would hold one or two points.
const PERIODS: { value: Period; label: string; since: (now: Date) => Date | null }[] = [
  { value: '3m', label: '3М', since: (now) => subMonths(now, 3) },
  { value: '1y', label: 'Год', since: (now) => subYears(now, 1) },
  { value: 'all', label: 'Всё', since: () => null },
]

const formatDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy', { locale: ru })

/** One body part (or body weight) over time; tap a point to open its session. */
export const MeasurementChart = ({ className }: MeasurementChartProps) => {
  const measurements = useMeasurements()
  const tracks = useMemo(() => getMeasurementTracks(measurements), [measurements])
  const [trackId, setTrackId] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Fixed on mount: periods are counted in days, re-renders must not shift them.
  const [now] = useState(() => new Date())

  if (tracks.length === 0) {
    return <p className={cn('py-8 text-center text-text-muted', className)}>Замеров пока нет</p>
  }

  // The chosen part may disappear (its only session deleted): fall back to the first one.
  const track = tracks.find((item) => item.id === trackId) ?? tracks[0]
  const since = PERIODS.find((item) => item.value === period)?.since(now) ?? null
  const points = since ? track.points.filter((point) => parseISO(point.date) >= since) : track.points
  const formatValue = (value: number) => `${formatNumber(value)} ${track.unit}`

  const selectedIndex = track.points.findIndex((point) => point.measurementId === selectedId)
  const selected: TrackPoint | undefined = track.points[selectedIndex]
  const previous: TrackPoint | undefined = track.points[selectedIndex - 1]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label="Что показать на графике"
      >
        {tracks.map((item) => (
          <Chip
            key={item.id}
            active={item.id === track.id}
            className="shrink-0"
            onClick={() => {
              setTrackId(item.id)
              setSelectedId(null)
            }}
          >
            {item.name}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Период">
        {PERIODS.map((item) => (
          <Chip
            key={item.value}
            active={item.value === period}
            onClick={() => {
              setPeriod(item.value)
              setSelectedId(null)
            }}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-muted p-2">
        {points.length === 0 ? (
          <p className="py-16 text-center text-text-muted">Нет замеров за этот период</p>
        ) : (
          <LineChart
            aria-label={`График: ${track.name}, ${track.unit}`}
            series={[
              {
                id: track.id,
                tone: 'primary',
                points: points.map((point) => ({
                  key: point.measurementId,
                  x: parseISO(point.date).getTime(),
                  y: point.value,
                  label: `${formatDate(point.date)}: ${formatValue(point.value)}`,
                })),
              },
            ]}
            selectedKey={selectedId}
            onSelect={setSelectedId}
            formatX={(x) => format(x, 'd MMM', { locale: ru })}
            formatY={(y) => formatNumber(y)}
          />
        )}
      </div>

      {selected ? (
        <Link
          to={paths.measurement(selected.measurementId)}
          className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-2 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
        >
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{formatDate(selected.date)}</span>
            {previous && (
              <span className="text-xs text-text-muted">
                {formatDiff(selected.value, previous.value)} {track.unit} с {formatDate(previous.date)}
              </span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-lg font-bold">{formatValue(selected.value)}</span>
            <span aria-hidden="true" className="text-text-muted">›</span>
          </span>
        </Link>
      ) : (
        <p className="text-center text-sm text-text-muted">
          {track.points.length < 2
            ? 'Линия появится после второго замера'
            : 'Нажмите на точку, чтобы открыть замер'}
        </p>
      )}
    </div>
  )
}

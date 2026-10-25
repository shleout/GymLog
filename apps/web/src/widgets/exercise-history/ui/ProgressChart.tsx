import { format, parseISO, subMonths, subYears } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatSet, type ExerciseProgress, type ProgressPoint } from '@/entities/workout'
import { paths } from '@/shared/config'
import { cn, formatNumber } from '@/shared/lib'
import { Chip, LineChart, type ChartSeries } from '@/shared/ui'
import { formatShortDate } from '../lib/formatDate'
import { formatProgressValue } from '../lib/formatProgressValue'

type ProgressChartProps = {
  progress: ExerciseProgress
}

type Period = '1m' | '3m' | '1y' | 'all'
type SeriesId = 'estimate' | 'singles'

const PERIODS: { value: Period; label: string; since: (now: Date) => Date | null }[] = [
  { value: '1m', label: '1М', since: (now) => subMonths(now, 1) },
  { value: '3m', label: '3М', since: (now) => subMonths(now, 3) },
  { value: '1y', label: 'Год', since: (now) => subYears(now, 1) },
  { value: 'all', label: 'Всё', since: () => null },
]

const SERIES_LABELS: Record<SeriesId, string> = { estimate: 'Расчётный', singles: 'На раз' }

const pointKey = (seriesId: SeriesId, point: ProgressPoint) => `${seriesId}:${point.workoutId}`

export const ProgressChart = ({ progress }: ProgressChartProps) => {
  const [period, setPeriod] = useState<Period>('all')
  const [visible, setVisible] = useState<Record<SeriesId, boolean>>({ estimate: true, singles: false })
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  // Fixed on mount: periods are counted in days, re-renders must not shift them.
  const [now] = useState(() => new Date())

  const since = PERIODS.find((item) => item.value === period)?.since(now) ?? null
  const inPeriod = (points: ProgressPoint[]) =>
    since ? points.filter((point) => parseISO(point.date) >= since) : points

  const hasSingles = progress.kind === 'weight' && progress.singles.length > 0
  const pointsBySeries: Record<SeriesId, ProgressPoint[]> = {
    estimate: visible.estimate || !hasSingles ? inPeriod(progress.points) : [],
    singles: hasSingles && visible.singles ? inPeriod(progress.singles) : [],
  }

  // Bodyweight exercises have one series: the most reps, not an estimate.
  const seriesLabel = (id: SeriesId) => (progress.kind === 'reps' ? 'Лучший подход' : SERIES_LABELS[id])

  const toChartSeries = (id: SeriesId, tone: ChartSeries['tone'], dashed: boolean): ChartSeries => ({
    id,
    tone,
    dashed,
    points: pointsBySeries[id].map((point) => ({
      key: pointKey(id, point),
      x: parseISO(point.date).getTime(),
      y: point.value,
      label: `${seriesLabel(id)}, ${formatShortDate(point.date)}: ${formatProgressValue(point, progress.kind)}`,
    })),
  })
  const series = [toChartSeries('estimate', 'primary', false), toChartSeries('singles', 'accent', true)]

  const selected = (['estimate', 'singles'] as const)
    .flatMap((id) => pointsBySeries[id].map((point) => ({ id, point })))
    .find(({ id, point }) => pointKey(id, point) === selectedKey)

  /** At least one series always stays on. */
  const toggleSeries = (id: SeriesId) =>
    setVisible((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      return next.estimate || next.singles ? next : prev
    })

  const isEmpty = series.every((item) => item.points.length === 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Период">
        {PERIODS.map((item) => (
          <Chip
            key={item.value}
            active={item.value === period}
            onClick={() => {
              setPeriod(item.value)
              setSelectedKey(null)
            }}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      {hasSingles && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Показатели на графике">
          {(['estimate', 'singles'] as const).map((id) => (
            <Chip
              key={id}
              active={visible[id]}
              onClick={() => {
                toggleSeries(id)
                setSelectedKey(null)
              }}
            >
              <span
                aria-hidden="true"
                className={cn('size-2.5 rounded-full', id === 'estimate' ? 'bg-primary' : 'bg-accent')}
              />
              {SERIES_LABELS[id]}
            </Chip>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-surface-muted p-2">
        {isEmpty ? (
          <p className="py-16 text-center text-text-muted">Нет тренировок за этот период</p>
        ) : (
          <LineChart
            aria-label={progress.kind === 'weight' ? 'График 1ПМ, кг' : 'График повторений'}
            series={series}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
            formatX={(x) => format(x, 'd MMM', { locale: ru })}
            formatY={(y) => formatNumber(y)}
          />
        )}
      </div>

      {selected ? (
        <Link
          to={paths.workout(selected.point.workoutId)}
          className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-2 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
        >
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{formatShortDate(selected.point.date)}</span>
            <span className="text-xs text-text-muted">
              {seriesLabel(selected.id)} · {formatSet(selected.point.set)}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-lg font-bold">{formatProgressValue(selected.point, progress.kind)}</span>
            <span aria-hidden="true" className="text-text-muted">›</span>
          </span>
        </Link>
      ) : (
        <p className="text-center text-sm text-text-muted">
          {progress.points.length < 2
            ? 'Линия появится после второй тренировки'
            : 'Нажмите на точку, чтобы увидеть подход'}
        </p>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useExercises } from '@/entities/exercise'
import {
  filterSessionsByMode,
  getExerciseProgress,
  getExerciseSessions,
  getExerciseTrend,
  getLatestMode,
  STALL_SESSIONS,
  useWorkouts,
  type ExerciseProgress,
  type ExerciseTrend,
  type TrendStatus,
} from '@/entities/workout'
import { paths } from '@/shared/config'
import { cn, formatDuration, formatNumber, pluralize } from '@/shared/lib'
import { SegmentedControl } from '@/shared/ui'

type ProgressOverviewProps = {
  className?: string
}

type Period = '1' | '3' | 'all'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1', label: 'Месяц' },
  { value: '3', label: '3 месяца' },
  { value: 'all', label: 'Всё время' },
]

const PERIOD_MONTHS: Record<Period, number | undefined> = { '1': 1, '3': 3, all: undefined }

type Row = {
  id: string
  name: string
  kind: ExerciseProgress['kind']
  trend: ExerciseTrend
}

type Group = {
  status: TrendStatus
  title: string
  hint?: string
}

const GROUPS: Group[] = [
  { status: 'up', title: 'Растёт' },
  {
    status: 'stalled',
    title: 'Застой',
    hint: `Последние ${STALL_SESSIONS} тренировки без нового лучшего результата`,
  },
  { status: 'down', title: 'Просело', hint: 'Лучший результат ниже, чем раньше' },
  { status: 'flat', title: 'Без изменений' },
  { status: 'new', title: 'Пока не с чем сравнить' },
  { status: 'idle', title: 'Не выполнялись за период' },
]

const formatValue = (kind: Row['kind'], value: number): string =>
  ({
    weight: `${formatNumber(value)} кг`,
    reps: `${formatNumber(value)} повт.`,
    time: formatDuration(value),
  })[kind]

/** `↑ 12%`, `↓ 3%`, `±0`. */
const formatPercent = (percent: number): string => {
  const rounded = Math.round(percent)
  if (rounded === 0) return '±0'
  return `${rounded > 0 ? '↑' : '↓'} ${Math.abs(rounded)}%`
}

const countLabel = (count: number): string =>
  `${count} ${pluralize(count, ['упражнение', 'упражнения', 'упражнений'])}`

const sortRows = (status: TrendStatus, rows: Row[]): Row[] => {
  const byName = (a: Row, b: Row) => a.name.localeCompare(b.name, 'ru')
  if (status === 'up') return rows.sort((a, b) => (b.trend.percent ?? 0) - (a.trend.percent ?? 0) || byName(a, b))
  if (status === 'down') return rows.sort((a, b) => (a.trend.percent ?? 0) - (b.trend.percent ?? 0) || byName(a, b))
  return rows.sort(byName)
}

const TrendRow = ({ row }: { row: Row }) => {
  const { trend } = row
  const hasComparison = trend.before !== undefined && trend.current !== undefined
  return (
    <Link
      to={paths.exercise(row.id)}
      className="flex min-h-14 items-center gap-3 rounded-2xl bg-surface-muted p-4 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="break-words font-semibold">{row.name}</span>
        {hasComparison ? (
          <span className="text-sm text-text-muted">
            {formatValue(row.kind, trend.before!)} → {formatValue(row.kind, trend.current!)}
          </span>
        ) : (
          trend.current !== undefined && (
            <span className="text-sm text-text-muted">{formatValue(row.kind, trend.current)}</span>
          )
        )}
      </span>
      {trend.percent !== undefined && (
        <span
          className={cn(
            'shrink-0 font-semibold',
            trend.status === 'up' && 'text-primary',
            trend.status === 'down' && 'text-danger',
            trend.status !== 'up' && trend.status !== 'down' && 'text-text-muted',
          )}
        >
          {formatPercent(trend.percent)}
        </span>
      )}
      <span aria-hidden="true" className="text-text-muted">›</span>
    </Link>
  )
}

export const ProgressOverview = ({ className }: ProgressOverviewProps) => {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const [period, setPeriod] = useState<Period>('3')
  const [now] = useState(() => Date.now())

  const groups = useMemo(() => {
    const byStatus = new Map<TrendStatus, Row[]>()
    for (const exercise of exercises) {
      const sessions = getExerciseSessions(workouts, exercise.id)
      if (sessions.length === 0) continue
      // Reps and holds are not comparable: the exercise is judged by the way it was done last.
      const progress = getExerciseProgress(
        filterSessionsByMode(sessions, getLatestMode(sessions) ?? 'reps'),
      )
      const trend = getExerciseTrend(progress.points, PERIOD_MONTHS[period], now)
      const rows = byStatus.get(trend.status) ?? []
      rows.push({ id: exercise.id, name: exercise.name, kind: progress.kind, trend })
      byStatus.set(trend.status, rows)
    }
    return GROUPS.flatMap((group) => {
      const rows = byStatus.get(group.status)
      return rows ? [{ ...group, rows: sortRows(group.status, rows) }] : []
    })
  }, [exercises, workouts, period, now])

  if (groups.length === 0) {
    return (
      <p className={cn('py-8 text-center text-text-muted', className)}>
        Прогресс появится после первой тренировки.
      </p>
    )
  }

  const count = (status: TrendStatus) => groups.find((group) => group.status === status)?.rows.length ?? 0

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <SegmentedControl
        aria-label="Период"
        options={PERIOD_OPTIONS}
        value={period}
        onChange={setPeriod}
      />

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Растёт', value: count('up'), className: 'text-primary' },
          { label: 'Застой', value: count('stalled'), className: 'text-accent' },
          { label: 'Просело', value: count('down'), className: 'text-danger' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col-reverse rounded-2xl bg-surface-muted p-3">
            <dt className="text-sm text-text-muted">{item.label}</dt>
            <dd className={cn('font-display text-2xl font-bold', item.className)}>{item.value}</dd>
          </div>
        ))}
      </dl>

      {groups.map((group) => (
        <section key={group.status} aria-label={group.title} className="flex flex-col gap-2">
          <div>
            <h2 className="text-base font-semibold">
              {group.title} <span className="font-normal text-text-muted">· {countLabel(group.rows.length)}</span>
            </h2>
            {group.hint && <p className="text-sm text-text-muted">{group.hint}</p>}
          </div>
          <ul className="flex flex-col gap-2">
            {group.rows.map((row) => (
              <li key={row.id}>
                <TrendRow row={row} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

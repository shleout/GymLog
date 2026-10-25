import { useState } from 'react'
import {
  formatSet,
  getRecentChange,
  type ExerciseProgress,
  type ProgressPoint,
} from '@/entities/workout'
import { formatDiff, pluralize } from '@/shared/lib'
import { formatShortDate } from '../lib/formatDate'
import { formatProgressValue } from '../lib/formatProgressValue'

type ExerciseSummaryProps = {
  progress: ExerciseProgress
}

const RECENT_MONTHS = 3

const getMax = (points: ProgressPoint[]): ProgressPoint | undefined =>
  points.reduce<ProgressPoint | undefined>(
    (best, point) => (!best || point.value > best.value ? point : best),
    undefined,
  )

export const ExerciseSummary = ({ progress }: ExerciseSummaryProps) => {
  const best = getMax(progress.points)
  const bestSingle = getMax(progress.singles)
  // Fixed on mount, like the chart periods: re-renders must not shift the window.
  const [now] = useState(() => Date.now())
  const change = getRecentChange(progress.points, RECENT_MONTHS, now)
  const unit = progress.kind === 'weight' ? 'кг' : 'повт.'

  if (!best) return null

  const rows = [
    {
      label: progress.kind === 'weight' ? 'Расчётный 1ПМ' : 'Лучший результат',
      value: formatProgressValue(best, progress.kind),
      details: [
        formatShortDate(best.date),
        ...(progress.kind === 'weight' && best.set.reps > 1 ? [formatSet(best.set)] : []),
      ],
    },
    ...(bestSingle
      ? [
          {
            label: 'На раз',
            value: formatProgressValue(bestSingle, 'weight'),
            details: [
              formatShortDate(bestSingle.date),
              `${progress.singleCount} ${pluralize(progress.singleCount, ['попытка', 'попытки', 'попыток'])}`,
            ],
          },
        ]
      : []),
  ]

  return (
    <dl className="flex flex-col rounded-2xl bg-surface-muted px-4">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex min-h-14 items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
        >
          <dt className="flex min-w-0 flex-col">
            <span className="font-medium">{row.label}</span>
            <span className="text-xs text-text-muted">{row.details.join(' · ')}</span>
          </dt>
          <dd className="shrink-0 text-lg font-bold">{row.value}</dd>
        </div>
      ))}
      {change !== undefined && (
        <div className="flex min-h-11 items-center justify-between gap-3 py-2">
          <dt className="text-sm text-text-muted">За {RECENT_MONTHS} месяца</dt>
          <dd className={change > 0 ? 'font-semibold text-primary' : 'font-semibold text-text-muted'}>
            {formatDiff(change, 0)} {unit}
          </dd>
        </div>
      )}
    </dl>
  )
}

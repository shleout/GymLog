import { useState } from 'react'
import { Link } from 'react-router'
import type { MaxRepsRecord, RepRecord } from '@/entities/workout'
import { paths } from '@/shared/config'
import { formatNumber } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { formatShortDate } from '../lib/formatDate'

type RecordsTableProps =
  | { kind: 'weight'; records: RepRecord[] }
  | { kind: 'reps'; records: MaxRepsRecord[] }

type Row = {
  key: string
  title: string
  value: string
  workoutId: string
  date: string
}

const COLLAPSED_COUNT = 6

const DESCRIPTIONS = {
  weight: 'Подходы, которые не побил ни один другой — одновременно по весу и по повторениям.',
  reps: 'Рекорд повторений за один подход и как он рос — сверху текущий.',
}

const toRows = (props: RecordsTableProps): Row[] =>
  props.kind === 'weight'
    ? props.records.map((record) => ({
        key: String(record.reps),
        title: `${record.reps} повт.`,
        value: `${formatNumber(record.weight)} кг`,
        workoutId: record.workoutId,
        date: record.date,
      }))
    : props.records.map((record, index) => ({
        key: record.workoutId,
        title: index === 0 ? 'Текущий рекорд' : 'Был рекордом',
        value: `${record.reps} повт.`,
        workoutId: record.workoutId,
        date: record.date,
      }))

export const RecordsTable = (props: RecordsTableProps) => {
  const [expanded, setExpanded] = useState(false)
  const rows = toRows(props)

  if (rows.length === 0) {
    return <p className="py-8 text-center text-text-muted">Рекордов пока нет</p>
  }

  const shown = expanded ? rows : rows.slice(0, COLLAPSED_COUNT)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">{DESCRIPTIONS[props.kind]}</p>
      <ul className="flex flex-col rounded-2xl bg-surface-muted px-4">
        {shown.map((row) => (
          <li key={row.key} className="border-b border-border last:border-b-0">
            <Link
              to={paths.workout(row.workoutId)}
              className="flex min-h-14 items-center justify-between gap-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="flex min-w-0 flex-col">
                <span className="font-medium">{row.title}</span>
                <span className="text-xs text-text-muted">{formatShortDate(row.date)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-lg font-bold">{row.value}</span>
                <span aria-hidden="true" className="text-text-muted">›</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {rows.length > COLLAPSED_COUNT && (
        <Button variant="secondary" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Свернуть' : `Показать все (${rows.length})`}
        </Button>
      )}
    </div>
  )
}

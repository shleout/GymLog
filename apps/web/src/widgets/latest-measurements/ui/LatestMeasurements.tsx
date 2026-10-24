import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { getLatestMeasurements, useMeasurements, type LatestValue } from '@/entities/measurement'
import { cn, formatDiff, formatNumber } from '@/shared/lib'

type LatestMeasurementsProps = {
  className?: string
}

type Row = {
  key: string
  name: string
  unit: string
  latest: LatestValue
}

const formatDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy', { locale: ru })

const formatLatestDiff = (latest: LatestValue): string | null =>
  latest.previous ? formatDiff(latest.value, latest.previous.value) : null

/** Latest body weight and value of every measured body part, with change to the previous one. */
export const LatestMeasurements = ({ className }: LatestMeasurementsProps) => {
  const measurements = useMeasurements()
  const latest = useMemo(() => getLatestMeasurements(measurements), [measurements])

  const rows: Row[] = [
    ...(latest.weight ? [{ key: 'weight', name: 'Вес тела', unit: 'кг', latest: latest.weight }] : []),
    ...latest.parts.map((part) => ({ key: part.key, name: part.name, unit: 'см', latest: part })),
  ]

  if (rows.length === 0) {
    return <p className={cn('py-8 text-center text-text-muted', className)}>Замеров пока нет</p>
  }

  return (
    <ul className={cn('flex flex-col rounded-2xl bg-surface-muted px-4', className)}>
      {rows.map((row) => {
        const diff = formatLatestDiff(row.latest)
        return (
          <li
            key={row.key}
            className="flex min-h-14 items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{row.name}</span>
              <span className="text-xs text-text-muted">{formatDate(row.latest.date)}</span>
            </div>
            <div className="flex shrink-0 items-baseline gap-2">
              {diff && <span className="text-sm text-text-muted">{diff}</span>}
              <span className="text-lg font-bold">
                {formatNumber(row.latest.value)} {row.unit}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

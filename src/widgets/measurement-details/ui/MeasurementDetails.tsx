import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import {
  getPreviousValues,
  useMeasurementStore,
  type MeasuredValue,
  type Measurement,
} from '@/entities/measurement'
import { cn, formatDiff, formatNumber, normalizeName } from '@/shared/lib'

type MeasurementDetailsProps = {
  measurement: Measurement
  className?: string
}

type Row = {
  key: string
  name: string
  value: number
  unit: string
  previous?: MeasuredValue
}

export const MeasurementDetails = ({ measurement, className }: MeasurementDetailsProps) => {
  const measurements = useMeasurementStore((state) => state.measurements)
  const previous = useMemo(
    () => getPreviousValues(measurements, measurement),
    [measurements, measurement],
  )

  const rows: Row[] = [
    ...(measurement.weight !== undefined
      ? [{ key: 'weight', name: 'Вес', value: measurement.weight, unit: 'кг', previous: previous.weight }]
      : []),
    ...measurement.values.map((value, index) => ({
      key: `${value.name}-${index}`,
      name: value.name,
      value: value.value,
      unit: 'см',
      previous: previous.parts.get(normalizeName(value.name)),
    })),
  ]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-text-muted">В этой сессии нет замеров</p>
      ) : (
        <ul className="flex flex-col rounded-2xl bg-surface-muted px-4">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex min-h-14 items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{row.name}</span>
                {row.previous && (
                  <span className="text-xs text-text-muted">
                    было {formatNumber(row.previous.value)} {row.unit},{' '}
                    {format(parseISO(row.previous.date), 'd MMM yyyy', { locale: ru })}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-baseline gap-2">
                {row.previous && (
                  <span className="text-sm text-text-muted">
                    {formatDiff(row.value, row.previous.value)}
                  </span>
                )}
                <span className="text-lg font-bold">
                  {formatNumber(row.value)} {row.unit}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

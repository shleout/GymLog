import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { sortMeasurementsDesc, useMeasurementStore } from '@/entities/measurement'
import { paths } from '@/shared/config'
import { cn, formatNumber } from '@/shared/lib'

type MeasurementListProps = {
  className?: string
}

export const MeasurementList = ({ className }: MeasurementListProps) => {
  const measurements = useMeasurementStore((state) => state.measurements)

  const sortedMeasurements = useMemo(() => sortMeasurementsDesc(measurements), [measurements])

  if (measurements.length === 0) {
    return (
      <p className={cn('py-8 text-center text-text-muted', className)}>Сессий замеров пока нет</p>
    )
  }

  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {sortedMeasurements.map((measurement) => (
        <li key={measurement.id}>
          <Link
            to={paths.measurement(measurement.id)}
            className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-4 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">
                {format(parseISO(measurement.date), 'd MMMM yyyy, EEEE', { locale: ru })}
              </h3>
              <span aria-hidden="true" className="text-text-muted">›</span>
            </div>
            <ul className="flex flex-col gap-1 text-sm text-text-muted">
              {measurement.weight !== undefined && (
                <li className="flex justify-between gap-2">
                  <span className="text-text">Вес</span>
                  <span>{formatNumber(measurement.weight)} кг</span>
                </li>
              )}
              {measurement.values.map((value, index) => (
                <li key={`${value.name}-${index}`} className="flex justify-between gap-2">
                  <span className="truncate text-text">{value.name}</span>
                  <span className="shrink-0">{formatNumber(value.value)} см</span>
                </li>
              ))}
            </ul>
          </Link>
        </li>
      ))}
    </ul>
  )
}

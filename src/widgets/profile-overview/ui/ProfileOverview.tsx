import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo, type ReactNode } from 'react'
import { getLatestMeasurements, useMeasurementStore, type LatestValue } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { cn, formatDiff, formatNumber } from '@/shared/lib'

type ProfileOverviewProps = {
  /** Rendered next to the measurements heading, e.g. a "new measurements" link. */
  measurementsAction?: ReactNode
  className?: string
}

const formatDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy', { locale: ru })

const formatLatestDiff = (latest: LatestValue): string | null =>
  latest.previous ? formatDiff(latest.value, latest.previous.value) : null

export const ProfileOverview = ({ measurementsAction, className }: ProfileOverviewProps) => {
  const profile = useProfileStore((state) => state.profile)
  const measurements = useMeasurementStore((state) => state.measurements)
  const latest = useMemo(() => getLatestMeasurements(measurements), [measurements])

  const weightDiff = latest.weight ? formatLatestDiff(latest.weight) : null

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <section className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground"
        >
          {profile.nickname.trim().charAt(0).toUpperCase() || '?'}
        </div>
        <p className={cn('text-2xl font-bold', !profile.nickname && 'text-text-muted')}>
          {profile.nickname || 'Без никнейма'}
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-2">
        <div className="flex flex-col rounded-2xl bg-surface-muted px-4 py-3">
          <dt className="text-xs font-medium uppercase text-text-muted">Рост</dt>
          <dd className="text-xl font-bold">
            {profile.height === undefined ? (
              <span className="text-text-muted">—</span>
            ) : (
              `${formatNumber(profile.height)} см`
            )}
          </dd>
        </div>
        <div className="flex flex-col rounded-2xl bg-surface-muted px-4 py-3">
          <dt className="text-xs font-medium uppercase text-text-muted">Вес</dt>
          <dd className="flex flex-col">
            {latest.weight ? (
              <>
                <span className="text-xl font-bold">
                  {formatNumber(latest.weight.value)} кг
                  {weightDiff && (
                    <span className="ml-2 text-sm font-medium text-text-muted">{weightDiff}</span>
                  )}
                </span>
                <span className="text-xs text-text-muted">{formatDate(latest.weight.date)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-text-muted">—</span>
            )}
          </dd>
        </div>
      </dl>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Замеры</h2>
          {measurementsAction}
        </div>

        {latest.parts.length === 0 ? (
          <p className="py-8 text-center text-text-muted">Замеров пока нет</p>
        ) : (
          <ul className="flex flex-col rounded-2xl bg-surface-muted px-4">
            {latest.parts.map((part) => {
              const diff = formatLatestDiff(part)
              return (
                <li
                  key={part.key}
                  className="flex min-h-14 items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{part.name}</span>
                    <span className="text-xs text-text-muted">{formatDate(part.date)}</span>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-2">
                    {diff && <span className="text-sm text-text-muted">{diff}</span>}
                    <span className="text-lg font-bold">{formatNumber(part.value)} см</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

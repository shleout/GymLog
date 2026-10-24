import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { getLatestMeasurements, useMeasurements, type LatestValue } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { ROUTES } from '@/shared/config'
import { cn, formatDiff, formatNumber } from '@/shared/lib'

type ProfileOverviewProps = {
  className?: string
}

const formatDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy', { locale: ru })

const formatLatestDiff = (latest: LatestValue): string | null =>
  latest.previous ? formatDiff(latest.value, latest.previous.value) : null

export const ProfileOverview = ({ className }: ProfileOverviewProps) => {
  const profile = useProfileStore((state) => state.profile)
  const measurements = useMeasurements()
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
        {/* Body weight lives in measurements, so the whole card links there (stretched link). */}
        <div className="relative flex flex-col rounded-2xl bg-surface-muted px-4 py-3 transition-colors has-[a:hover]:bg-surface-muted/70 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-primary">
          <dt className="text-xs font-medium uppercase text-text-muted">
            <Link
              to={ROUTES.measurements}
              className="flex justify-between outline-none after:absolute after:inset-0 after:rounded-2xl"
            >
              Вес
              <span aria-hidden="true">›</span>
            </Link>
          </dt>
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
    </div>
  )
}

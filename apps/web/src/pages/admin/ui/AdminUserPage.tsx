import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useAdminUserData } from '@/entities/admin-user'
import { getLatestMeasurements } from '@/entities/measurement'
import { LatestMeasurementsView } from '@/widgets/latest-measurements'
import { MeasurementChartView } from '@/widgets/measurement-chart'
import { MeasurementListView } from '@/widgets/measurement-list'
import { WorkoutListView } from '@/widgets/workout-list'
import { paths, ROUTES, type AdminUserView } from '@/shared/config'
import { formatNumber } from '@/shared/lib'
import { SegmentedControl } from '@/shared/ui'
import { formatShortDate, getDisplayName } from '../lib/format'
import { AdminHeader } from './AdminHeader'
import { LoadStatus } from './LoadStatus'

const VIEWS: { value: AdminUserView; label: string }[] = [
  { value: 'workouts', label: 'Тренировки' },
  { value: 'measurements', label: 'Замеры' },
]

type HistoryView = 'chart' | 'list'

const HISTORY_VIEWS: { value: HistoryView; label: string }[] = [
  { value: 'chart', label: 'График' },
  { value: 'list', label: 'Список' },
]

const Empty = () => <span className="text-text-muted">—</span>

/** Another user's profile, workouts and measurements, read only. */
export const AdminUserPage = () => {
  const { userId = '' } = useParams()
  const resource = useAdminUserData(userId)
  const [searchParams, setSearchParams] = useSearchParams()
  const view: AdminUserView = searchParams.get('view') === 'measurements' ? 'measurements' : 'workouts'
  const [historyView, setHistoryView] = useState<HistoryView>('chart')

  const data = resource.data
  const latestWeight = useMemo(
    () => (data ? getLatestMeasurements(data.measurements).weight : null),
    [data],
  )

  // `replace`: switching sections isn't a step to go back through.
  const changeView = (next: AdminUserView) =>
    setSearchParams(next === 'workouts' ? {} : { view: next }, { replace: true })

  const summary = data
    ? [
        {
          label: 'Рост',
          value: data.profile?.height === undefined ? <Empty /> : `${formatNumber(data.profile.height)} см`,
        },
        {
          label: 'Вес',
          value: latestWeight ? `${formatNumber(latestWeight.value)} кг` : <Empty />,
        },
        { label: 'Тренировок', value: formatNumber(data.user.workoutsCount) },
        {
          label: 'Последняя',
          value: data.user.lastWorkoutDate ? formatShortDate(data.user.lastWorkoutDate) : <Empty />,
        },
      ]
    : []

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <AdminHeader
        backTo={ROUTES.admin}
        backLabel="Назад к пользователям"
        title={data ? getDisplayName(data.user) : 'Пользователь'}
        subtitle={
          data &&
          [data.user.nickname !== null && data.user.email, `с ${formatShortDate(data.user.createdAt)}`]
            .filter(Boolean)
            .join(' · ')
        }
      />

      <LoadStatus resource={resource} onRetry={resource.reload} />

      {data && (
        <>
          <dl className="grid grid-cols-2 gap-2">
            {summary.map((item) => (
              <div key={item.label} className="flex flex-col rounded-2xl bg-surface-muted px-4 py-3">
                <dt className="text-xs font-medium uppercase text-text-muted">{item.label}</dt>
                <dd className="text-xl font-bold">{item.value}</dd>
              </div>
            ))}
          </dl>

          <SegmentedControl aria-label="Раздел" options={VIEWS} value={view} onChange={changeView} />

          {view === 'workouts' ? (
            <WorkoutListView
              workouts={data.workouts}
              exercises={data.exercises}
              getWorkoutLink={(workoutId) => paths.adminWorkout(userId, workoutId)}
            />
          ) : (
            <>
              <section className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Актуальные</h2>
                <LatestMeasurementsView measurements={data.measurements} />
              </section>
              <section className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">История</h2>
                <SegmentedControl
                  aria-label="Вид истории"
                  options={HISTORY_VIEWS}
                  value={historyView}
                  onChange={setHistoryView}
                />
                {historyView === 'chart' ? (
                  <MeasurementChartView
                    measurements={data.measurements}
                    getMeasurementLink={(measurementId) => paths.adminMeasurement(userId, measurementId)}
                  />
                ) : (
                  <MeasurementListView
                    measurements={data.measurements}
                    getMeasurementLink={(measurementId) => paths.adminMeasurement(userId, measurementId)}
                  />
                )}
              </section>
            </>
          )}
        </>
      )}
    </main>
  )
}

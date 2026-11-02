import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useParams } from 'react-router'
import { useAdminUserData } from '@/entities/admin-user'
import { MeasurementDetailsView } from '@/widgets/measurement-details'
import { paths } from '@/shared/config'
import { formatWeekday, getDisplayName } from '../lib/format'
import { AdminHeader } from './AdminHeader'
import { LoadStatus } from './LoadStatus'

/** Another user's measurement session, read only. */
export const AdminMeasurementPage = () => {
  const { userId = '', measurementId } = useParams()
  const resource = useAdminUserData(userId, { refresh: false })
  const data = resource.data
  const measurement = data?.measurements.find((item) => item.id === measurementId)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <AdminHeader
        backTo={paths.adminUser(userId, 'measurements')}
        backLabel="Назад к пользователю"
        title={
          measurement
            ? `Замеры ${format(parseISO(measurement.date), 'd MMMM yyyy', { locale: ru })}`
            : 'Замеры'
        }
        subtitle={
          data &&
          [measurement && formatWeekday(measurement.date), getDisplayName(data.user)]
            .filter(Boolean)
            .join(' · ')
        }
      />

      <LoadStatus resource={resource} onRetry={resource.reload} />

      {data &&
        (measurement ? (
          <MeasurementDetailsView measurement={measurement} measurements={data.measurements} />
        ) : (
          <p className="py-12 text-center text-lg text-text-muted">Сессия замеров не найдена</p>
        ))}
    </main>
  )
}

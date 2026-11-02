import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useParams } from 'react-router'
import { useAdminUserData } from '@/entities/admin-user'
import { WorkoutDetailsView } from '@/widgets/workout-details'
import { paths } from '@/shared/config'
import { formatWeekday, getDisplayName } from '../lib/format'
import { AdminHeader } from './AdminHeader'
import { LoadStatus } from './LoadStatus'

/** Another user's workout, read only: no edit button, exercise names aren't links. */
export const AdminWorkoutPage = () => {
  const { userId = '', workoutId } = useParams()
  const resource = useAdminUserData(userId, { refresh: false })
  const data = resource.data
  const workout = data?.workouts.find((item) => item.id === workoutId)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <AdminHeader
        backTo={paths.adminUser(userId)}
        backLabel="Назад к пользователю"
        title={workout ? format(parseISO(workout.date), 'd MMMM yyyy', { locale: ru }) : 'Тренировка'}
        subtitle={
          data &&
          [workout && formatWeekday(workout.date), getDisplayName(data.user)]
            .filter(Boolean)
            .join(' · ')
        }
      />

      <LoadStatus resource={resource} onRetry={resource.reload} />

      {data &&
        (workout ? (
          <WorkoutDetailsView workout={workout} exercises={data.exercises} />
        ) : (
          <p className="py-12 text-center text-lg text-text-muted">Тренировка не найдена</p>
        ))}
    </main>
  )
}

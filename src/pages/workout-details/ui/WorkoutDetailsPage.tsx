import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link, useParams } from 'react-router'
import { useWorkoutById } from '@/entities/workout'
import { WorkoutDetails } from '@/widgets/workout-details'
import { paths, ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const WorkoutDetailsPage = () => {
  const { workoutId } = useParams()
  const workout = useWorkoutById(workoutId)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link to={ROUTES.home} aria-label="Назад к списку" className={buttonStyles('ghost', 'px-3')}>
          ←
        </Link>
        {workout && (
          <>
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="text-2xl font-bold">
                {format(parseISO(workout.date), 'd MMMM yyyy', { locale: ru })}
              </h1>
              <p className="text-sm capitalize text-text-muted">
                {format(parseISO(workout.date), 'EEEE', { locale: ru })}
              </p>
            </div>
            <Link to={paths.editWorkout(workout.id)} className={buttonStyles('secondary')}>
              Изменить
            </Link>
          </>
        )}
      </header>

      {workout ? (
        <WorkoutDetails workout={workout} />
      ) : (
        <p className="py-12 text-center text-lg text-text-muted">Тренировка не найдена</p>
      )}
    </main>
  )
}

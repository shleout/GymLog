import { Link, useNavigate, useParams } from 'react-router'
import { useWorkoutById } from '@/entities/workout'
import { DeleteWorkoutButton } from '@/features/delete-workout'
import { WorkoutForm } from '@/features/workout-form'
import { paths, ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const EditWorkoutPage = () => {
  const { workoutId } = useParams()
  const workout = useWorkoutById(workoutId)
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link
          to={workout ? paths.workout(workout.id) : ROUTES.home}
          aria-label="Отменить редактирование"
          className={buttonStyles('ghost', 'px-3')}
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold">Редактирование</h1>
      </header>

      {workout ? (
        <>
          {/* Keyed by id so the draft is rebuilt if the route switches to another workout. */}
          <WorkoutForm
            key={workout.id}
            workout={workout}
            onSuccess={(id) => navigate(paths.workout(id), { replace: true })}
          />
          <div className="mt-4 flex flex-col border-t border-border pt-6">
            <DeleteWorkoutButton
              workoutId={workout.id}
              onDeleted={() => navigate(ROUTES.home, { replace: true })}
            />
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-lg text-text-muted">Тренировка не найдена</p>
      )}
    </main>
  )
}

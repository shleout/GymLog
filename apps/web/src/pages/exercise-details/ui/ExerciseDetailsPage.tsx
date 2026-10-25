import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useExerciseById } from '@/entities/exercise'
import { getExerciseSessions, useWorkouts } from '@/entities/workout'
import { DeleteExerciseButton } from '@/features/delete-exercise'
import { RenameExerciseForm } from '@/features/rename-exercise'
import { ExerciseHistory } from '@/widgets/exercise-history'
import { ROUTES } from '@/shared/config'
import { Button, buttonStyles } from '@/shared/ui'

export const ExerciseDetailsPage = () => {
  const { exerciseId } = useParams()
  const exercise = useExerciseById(exerciseId)
  const workouts = useWorkouts()
  const navigate = useNavigate()
  const [managing, setManaging] = useState(false)

  const workoutCount = useMemo(
    () => (exerciseId ? getExerciseSessions(workouts, exerciseId).length : 0),
    [workouts, exerciseId],
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link to={ROUTES.exercises} aria-label="Назад к упражнениям" className={buttonStyles('ghost', 'px-3')}>
          ←
        </Link>
        {exercise && (
          <>
            <h1 className="min-w-0 flex-1 break-words text-2xl font-bold">{exercise.name}</h1>
            <Button
              variant={managing ? 'secondary' : 'ghost'}
              aria-label="Изменить или удалить упражнение"
              aria-expanded={managing}
              onClick={() => setManaging((prev) => !prev)}
            >
              ⋯
            </Button>
          </>
        )}
      </header>

      {exercise ? (
        <>
          {managing && (
            <section className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
              <RenameExerciseForm exercise={exercise} onDone={() => setManaging(false)} />
              <DeleteExerciseButton
                exerciseId={exercise.id}
                workoutCount={workoutCount}
                onDeleted={() => navigate(ROUTES.exercises, { replace: true })}
              />
            </section>
          )}
          <ExerciseHistory exerciseId={exercise.id} />
        </>
      ) : (
        <p className="py-12 text-center text-lg text-text-muted">Упражнение не найдено</p>
      )}
    </main>
  )
}

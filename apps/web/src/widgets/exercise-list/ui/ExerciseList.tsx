import { useMemo, useState } from 'react'
import { useExercises } from '@/entities/exercise'
import { useWorkouts } from '@/entities/workout'
import { DeleteExerciseButton } from '@/features/delete-exercise'
import { RenameExerciseForm } from '@/features/rename-exercise'
import { cn, pluralize } from '@/shared/lib'
import { Button } from '@/shared/ui'

type ExerciseListProps = {
  className?: string
}

export const ExerciseList = ({ className }: ExerciseListProps) => {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const [editingId, setEditingId] = useState<string | null>(null)

  const sortedExercises = useMemo(
    () => [...exercises].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [exercises],
  )

  /** Exercise id → number of workouts it appears in (a workout counts once). */
  const workoutCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const workout of workouts) {
      for (const exerciseId of new Set(workout.entries.map((entry) => entry.exerciseId))) {
        counts.set(exerciseId, (counts.get(exerciseId) ?? 0) + 1)
      }
    }
    return counts
  }, [workouts])

  if (exercises.length === 0) {
    return (
      <p className={cn('py-8 text-center text-text-muted', className)}>
        Упражнений пока нет. Они появятся здесь и после первой тренировки.
      </p>
    )
  }

  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {sortedExercises.map((exercise) => {
        const workoutCount = workoutCounts.get(exercise.id) ?? 0

        return (
          <li key={exercise.id} className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
            {exercise.id === editingId ? (
              <>
                <RenameExerciseForm exercise={exercise} onDone={() => setEditingId(null)} />
                <DeleteExerciseButton
                  exerciseId={exercise.id}
                  workoutCount={workoutCount}
                  onDeleted={() => setEditingId(null)}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="break-words font-semibold">{exercise.name}</h3>
                  <p className="text-sm text-text-muted">
                    {workoutCount === 0
                      ? 'Ещё не выполнялось'
                      : `${workoutCount} ${pluralize(workoutCount, ['тренировка', 'тренировки', 'тренировок'])}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  aria-label={`Изменить упражнение «${exercise.name}»`}
                  onClick={() => setEditingId(exercise.id)}
                >
                  Изменить
                </Button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

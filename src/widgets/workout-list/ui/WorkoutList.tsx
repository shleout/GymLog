import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useExerciseStore } from '@/entities/exercise'
import { sortWorkoutsDesc, useWorkoutStore } from '@/entities/workout'
import { paths } from '@/shared/config'
import { cn, formatNumber } from '@/shared/lib'

type WorkoutListProps = {
  className?: string
}

export const WorkoutList = ({ className }: WorkoutListProps) => {
  const workouts = useWorkoutStore((state) => state.workouts)
  const exercises = useExerciseStore((state) => state.exercises)

  const sortedWorkouts = useMemo(() => sortWorkoutsDesc(workouts), [workouts])
  const exerciseNames = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name])),
    [exercises],
  )

  if (workouts.length === 0) {
    return (
      <p className={cn('py-12 text-center text-lg text-text-muted', className)}>
        Пока нет тренировок
      </p>
    )
  }

  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {sortedWorkouts.map((workout) => (
        <li key={workout.id}>
          <Link
            to={paths.workout(workout.id)}
            className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-4 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">
                {format(parseISO(workout.date), 'd MMMM yyyy, EEEE', { locale: ru })}
              </h2>
              <span aria-hidden="true" className="text-text-muted">›</span>
            </div>
            <ul className="flex flex-col gap-1 text-sm text-text-muted">
              {workout.entries.map((entry, index) => (
                <li key={`${entry.exerciseId}-${index}`} className="flex justify-between gap-2">
                  <span className="text-text">
                    {exerciseNames.get(entry.exerciseId) ?? 'Удалённое упражнение'}
                  </span>
                  <span>
                    {entry.sets
                      .map((set) =>
                        set.weight === undefined
                          ? `${set.reps}`
                          : `${formatNumber(set.weight)}×${set.reps}`,
                      )
                      .join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </Link>
        </li>
      ))}
    </ul>
  )
}

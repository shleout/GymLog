import { useMemo } from 'react'
import { useExerciseStore } from '@/entities/exercise'
import { getWorkoutStats, type Workout } from '@/entities/workout'
import { cn, formatNumber } from '@/shared/lib'

type WorkoutDetailsProps = {
  workout: Workout
  className?: string
}

export const WorkoutDetails = ({ workout, className }: WorkoutDetailsProps) => {
  const exercises = useExerciseStore((state) => state.exercises)
  const exerciseNames = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name])),
    [exercises],
  )
  const stats = getWorkoutStats(workout)

  const summary = [
    { label: 'Упражнений', value: formatNumber(stats.exercisesCount) },
    { label: 'Подходов', value: formatNumber(stats.setsCount) },
    { label: 'Повторений', value: formatNumber(stats.repsCount) },
    ...(stats.volume > 0 ? [{ label: 'Объём, кг', value: formatNumber(stats.volume) }] : []),
  ]

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="flex flex-col rounded-2xl bg-surface-muted px-4 py-3">
            <dt className="text-xs font-medium uppercase text-text-muted">{item.label}</dt>
            <dd className="text-xl font-bold">{item.value}</dd>
          </div>
        ))}
      </dl>

      {workout.entries.length === 0 && (
        <p className="py-8 text-center text-text-muted">В этой тренировке нет упражнений</p>
      )}

      {workout.entries.map((entry, entryIndex) => (
        <section
          key={`${entry.exerciseId}-${entryIndex}`}
          className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4"
        >
          <h2 className="text-lg font-semibold">
            {exerciseNames.get(entry.exerciseId) ?? 'Удалённое упражнение'}
          </h2>
          <table className="w-full text-left">
            <thead className="text-xs font-medium uppercase text-text-muted">
              <tr>
                <th scope="col" className="w-8 pb-1 text-center font-medium">#</th>
                <th scope="col" className="pb-1 font-medium">Вес, кг</th>
                <th scope="col" className="pb-1 font-medium">Повторы</th>
              </tr>
            </thead>
            <tbody>
              {entry.sets.map((set, setIndex) => (
                <tr key={set.id} className="border-t border-border">
                  <td className="py-2 text-center font-semibold text-text-muted">{setIndex + 1}</td>
                  <td className="py-2">
                    {set.weight === undefined ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      formatNumber(set.weight)
                    )}
                  </td>
                  <td className="py-2">{set.reps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

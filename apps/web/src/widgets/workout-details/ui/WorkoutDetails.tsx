import { useMemo } from 'react'
import { Link } from 'react-router'
import { useExerciseStore, type Exercise } from '@/entities/exercise'
import { getWorkoutStats, type Workout } from '@/entities/workout'
import { paths } from '@/shared/config'
import { cn, formatDuration, formatNumber } from '@/shared/lib'

type WorkoutDetailsProps = {
  workout: Workout
  className?: string
}

type WorkoutDetailsViewProps = WorkoutDetailsProps & {
  /** Including deleted ones: they still name the entries that reference them. */
  exercises: Exercise[]
  /** Exercise progress page; without it exercise names aren't links (admin panel). */
  getExerciseLink?: (exerciseId: string) => string
}

export const WorkoutDetails = ({ workout, className }: WorkoutDetailsProps) => (
  <WorkoutDetailsView
    workout={workout}
    exercises={useExerciseStore((state) => state.exercises)}
    getExerciseLink={paths.exercise}
    className={className}
  />
)

/** The same for a workout of any user, e.g. in the admin panel. */
export const WorkoutDetailsView = ({
  workout,
  exercises,
  getExerciseLink,
  className,
}: WorkoutDetailsViewProps) => {
  const exerciseNames = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name])),
    [exercises],
  )
  // Deleted exercises keep their name here, but have no progress page.
  const activeExerciseIds = useMemo(
    () => new Set(exercises.filter((exercise) => exercise.deletedAt === null).map((exercise) => exercise.id)),
    [exercises],
  )
  const stats = getWorkoutStats(workout)

  const summary = [
    { label: 'Упражнений', value: formatNumber(stats.exercisesCount) },
    { label: 'Подходов', value: formatNumber(stats.setsCount) },
    ...(stats.repsCount > 0 || stats.holdSeconds === 0
      ? [{ label: 'Повторений', value: formatNumber(stats.repsCount) }]
      : []),
    ...(stats.holdSeconds > 0
      ? [{ label: 'Под нагрузкой', value: formatDuration(stats.holdSeconds) }]
      : []),
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

      {workout.note && (
        <p className="whitespace-pre-line rounded-2xl bg-surface-muted px-4 py-3">{workout.note}</p>
      )}

      {workout.entries.length === 0 && (
        <p className="py-8 text-center text-text-muted">В этой тренировке нет упражнений</p>
      )}

      {workout.entries.map((entry, entryIndex) => {
        const hasRir = entry.sets.some((set) => set.rir !== undefined)
        return (
          <section
            key={`${entry.exerciseId}-${entryIndex}`}
            className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4"
          >
            <h2 className="text-lg font-semibold">
              {getExerciseLink && activeExerciseIds.has(entry.exerciseId) ? (
                <Link
                  to={getExerciseLink(entry.exerciseId)}
                  className="-my-2 inline-flex min-h-11 items-center gap-2 rounded-lg hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {exerciseNames.get(entry.exerciseId)}
                  <span aria-hidden="true" className="text-text-muted">›</span>
                </Link>
              ) : (
                (exerciseNames.get(entry.exerciseId) ?? 'Удалённое упражнение')
              )}
            </h2>
            <table className="w-full text-left">
              <thead className="text-xs font-medium uppercase text-text-muted">
                <tr>
                  <th scope="col" className="w-8 pb-1 text-center font-medium">#</th>
                  <th scope="col" className="pb-1 font-medium">Вес, кг</th>
                  <th scope="col" className="pb-1 font-medium">
                    {entry.sets.some((set) => set.durationSec !== undefined) ? 'Время' : 'Повторы'}
                  </th>
                  {hasRir && (
                    <th scope="col" className="w-12 pb-1 text-center font-medium">RIR</th>
                  )}
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
                    <td className="py-2">
                      {set.durationSec === undefined ? set.reps : formatDuration(set.durationSec)}
                    </td>
                    {hasRir && (
                      <td className="py-2 text-center">
                        {set.rir ?? <span className="text-text-muted">—</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {entry.note && <p className="whitespace-pre-line text-sm text-text-muted">{entry.note}</p>}
          </section>
        )
      })}
    </div>
  )
}

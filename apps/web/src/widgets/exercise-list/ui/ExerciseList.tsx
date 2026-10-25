import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { normalizeExerciseName, useExercises } from '@/entities/exercise'
import {
  getExerciseProgress,
  getExerciseSessions,
  getRecentChange,
  useWorkouts,
} from '@/entities/workout'
import { paths } from '@/shared/config'
import { cn, formatNumber, pluralize } from '@/shared/lib'
import { Input } from '@/shared/ui'

type ExerciseListProps = {
  className?: string
}

type Row = {
  id: string
  name: string
  /** Normalized name for the search. */
  key: string
  details: string
  /** Best estimated 1RM or best reps; absent for an exercise never done. */
  best?: string
  /** Change of the best over the last months, same unit as `best`. */
  change?: number
}

/** The same window as the summary on the exercise page. */
const RECENT_MONTHS = 3

/** `↑ 4`, `↓ 2,5`, `±0`. */
const formatChange = (change: number): string => {
  const rounded = Math.round(change * 10) / 10
  if (rounded === 0) return '±0'
  return `${rounded > 0 ? '↑' : '↓'} ${formatNumber(Math.abs(rounded))}`
}

export const ExerciseList = ({ className }: ExerciseListProps) => {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const [query, setQuery] = useState('')
  const [now] = useState(() => Date.now())

  const rows = useMemo(
    () =>
      [...exercises]
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
        .map((exercise): Row => {
          const base = { id: exercise.id, name: exercise.name, key: normalizeExerciseName(exercise.name) }
          const sessions = getExerciseSessions(workouts, exercise.id)
          if (sessions.length === 0) return { ...base, details: 'Ещё не выполнялось' }

          const progress = getExerciseProgress(sessions)
          const best = Math.max(...progress.points.map((point) => point.value))
          return {
            ...base,
            details: `${format(parseISO(sessions[0].date), 'd MMM', { locale: ru })} · ${sessions.length} ${pluralize(sessions.length, ['тренировка', 'тренировки', 'тренировок'])}`,
            best: progress.kind === 'weight' ? `1ПМ ${formatNumber(best)}` : `${best} повт.`,
            change: getRecentChange(progress.points, RECENT_MONTHS, now),
          }
        }),
    [exercises, workouts, now],
  )

  const queryKey = normalizeExerciseName(query)
  const shownRows = queryKey ? rows.filter((row) => row.key.includes(queryKey)) : rows

  if (exercises.length === 0) {
    return (
      <p className={cn('py-8 text-center text-text-muted', className)}>
        Упражнений пока нет. Они появятся здесь и после первой тренировки.
      </p>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Input
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Поиск упражнения"
        aria-label="Поиск упражнения"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {shownRows.length === 0 ? (
        <p className="py-8 text-center text-text-muted">Ничего не найдено</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shownRows.map((row) => (
            <li key={row.id}>
              <Link
                to={paths.exercise(row.id)}
                className="flex min-h-14 items-center gap-3 rounded-2xl bg-surface-muted p-4 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="break-words font-semibold">{row.name}</span>
                  <span className="text-sm text-text-muted">{row.details}</span>
                </span>
                {row.best && (
                  <span className="flex shrink-0 flex-col items-end">
                    <span className="font-semibold">{row.best}</span>
                    {row.change !== undefined && (
                      <span
                        aria-label={`За ${RECENT_MONTHS} месяца: ${formatChange(row.change)}`}
                        className={cn(
                          'text-sm font-semibold',
                          row.change > 0 ? 'text-primary' : row.change < 0 ? 'text-danger' : 'text-text-muted',
                        )}
                      >
                        {formatChange(row.change)}
                      </span>
                    )}
                  </span>
                )}
                <span aria-hidden="true" className="text-text-muted">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

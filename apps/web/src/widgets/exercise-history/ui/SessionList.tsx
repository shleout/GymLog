import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router'
import { formatSet, type ExerciseSession, type ProgressPoint } from '@/entities/workout'
import { paths } from '@/shared/config'
import { cn } from '@/shared/lib'

type SessionListProps = {
  sessions: ExerciseSession[]
  /** Best set of each workout (progress points), to mark it with ★. */
  points: ProgressPoint[]
}

export const SessionList = ({ sessions, points }: SessionListProps) => {
  const bestSetIds = new Set(points.map((point) => point.set.id))

  return (
    <ul className="flex flex-col gap-3">
      {sessions.map((session) => {
        const hasSingle = session.sets.some((set) => set.weight !== undefined && set.reps === 1)

        return (
          <li key={session.workoutId}>
            <Link
              to={paths.workout(session.workoutId)}
              className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-4 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">
                  {format(parseISO(session.date), 'd MMMM yyyy', { locale: ru })}
                </h3>
                <span className="flex items-center gap-2">
                  {hasSingle && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                      на раз
                    </span>
                  )}
                  <span aria-hidden="true" className="text-text-muted">›</span>
                </span>
              </div>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted">
                {session.sets.map((set) => {
                  const best = bestSetIds.has(set.id)
                  return (
                    <span key={set.id} className={cn(best && 'font-semibold text-primary')}>
                      {best && <span aria-label="лучший подход">★ </span>}
                      {formatSet(set)}
                    </span>
                  )
                })}
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

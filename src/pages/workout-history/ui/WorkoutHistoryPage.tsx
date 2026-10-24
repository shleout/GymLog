import { Link } from 'react-router'
import { WorkoutList } from '@/widgets/workout-list'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const WorkoutHistoryPage = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <h1 className="flex-1 text-2xl font-bold">Тренировки</h1>
      <Link to={ROUTES.profile} aria-label="Профиль" className={buttonStyles('secondary', 'px-0')}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-6"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </Link>
      <Link to={ROUTES.addWorkout} className={buttonStyles('primary')}>
        + Тренировка
      </Link>
    </header>
    {/* Future widgets (progress by workouts / exercises) go here. */}
    <WorkoutList />
  </main>
)

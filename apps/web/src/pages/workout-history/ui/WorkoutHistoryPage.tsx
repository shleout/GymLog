import { Link } from 'react-router'
import { WorkoutList } from '@/widgets/workout-list'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const WorkoutHistoryPage = () => (
  <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <h1 className="flex-1 text-2xl font-bold">Тренировки</h1>
      <Link to={ROUTES.addWorkout} className={buttonStyles('primary')}>
        + Тренировка
      </Link>
    </header>
    {/* Future widgets (progress by workouts / exercises) go here. */}
    <WorkoutList />
  </main>
)

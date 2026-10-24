import { Link, useNavigate } from 'react-router'
import { WorkoutForm } from '@/features/workout-form'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const AddWorkoutPage = () => {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link to={ROUTES.home} aria-label="Назад к списку" className={buttonStyles('ghost', 'px-3')}>
          ←
        </Link>
        <h1 className="text-2xl font-bold">Новая тренировка</h1>
      </header>
      <WorkoutForm onSuccess={() => navigate(ROUTES.home)} />
    </main>
  )
}

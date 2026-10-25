import { Link } from 'react-router'
import { AddExerciseForm } from '@/features/add-exercise'
import { ExerciseList } from '@/widgets/exercise-list'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const ExercisesPage = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <Link to={ROUTES.profile} aria-label="Назад в профиль" className={buttonStyles('ghost', 'px-3')}>
        ←
      </Link>
      <h1 className="text-2xl font-bold">Упражнения</h1>
    </header>
    <AddExerciseForm />
    <ExerciseList />
  </main>
)

import { AddExerciseForm } from '@/features/add-exercise'
import { ExerciseList } from '@/widgets/exercise-list'

export const ExercisesPage = () => (
  <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <h1 className="flex-1 text-2xl font-bold">Упражнения</h1>
    </header>
    <AddExerciseForm />
    <ExerciseList />
  </main>
)

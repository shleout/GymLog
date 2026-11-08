import { ProgressOverview } from '@/widgets/progress-overview'

export const ProgressPage = () => (
  <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6">
    <header>
      <h1 className="text-2xl font-bold">Прогресс</h1>
    </header>
    <ProgressOverview />
  </main>
)

import { Link, useNavigate } from 'react-router'
import { MeasurementForm } from '@/features/add-measurement'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const AddMeasurementPage = () => {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link to={ROUTES.measurements} aria-label="Назад к замерам" className={buttonStyles('ghost', 'px-3')}>
          ←
        </Link>
        <h1 className="text-2xl font-bold">Новые замеры</h1>
      </header>
      <MeasurementForm onSuccess={() => navigate(ROUTES.measurements, { replace: true })} />
    </main>
  )
}

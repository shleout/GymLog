import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link, useNavigate, useParams } from 'react-router'
import { useMeasurementById } from '@/entities/measurement'
import { DeleteMeasurementButton } from '@/features/delete-measurement'
import { MeasurementDetails } from '@/widgets/measurement-details'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const MeasurementDetailsPage = () => {
  const { measurementId } = useParams()
  const measurement = useMeasurementById(measurementId)
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link to={ROUTES.measurements} aria-label="Назад к замерам" className={buttonStyles('ghost', 'px-3')}>
          ←
        </Link>
        {measurement ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-2xl font-bold">
              Замеры {format(parseISO(measurement.date), 'd MMMM yyyy', { locale: ru })}
            </h1>
            <p className="text-sm capitalize text-text-muted">
              {format(parseISO(measurement.date), 'EEEE', { locale: ru })}
            </p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">Замеры</h1>
        )}
      </header>

      {measurement ? (
        <>
          <MeasurementDetails measurement={measurement} />
          <div className="mt-4 flex flex-col border-t border-border pt-6">
            <DeleteMeasurementButton
              measurementId={measurement.id}
              onDeleted={() => navigate(ROUTES.measurements, { replace: true })}
            />
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-lg text-text-muted">Сессия замеров не найдена</p>
      )}
    </main>
  )
}

import { Link } from 'react-router'
import { LatestMeasurements } from '@/widgets/latest-measurements'
import { MeasurementList } from '@/widgets/measurement-list'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const MeasurementsPage = () => (
  <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <h1 className="flex-1 text-2xl font-bold">Замеры</h1>
      <Link to={ROUTES.addMeasurement} className={buttonStyles('primary')}>
        + Замеры
      </Link>
    </header>
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Актуальные</h2>
      <LatestMeasurements />
    </section>
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">История</h2>
      <MeasurementList />
    </section>
  </main>
)

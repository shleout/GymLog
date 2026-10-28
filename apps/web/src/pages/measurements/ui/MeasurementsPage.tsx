import { useState } from 'react'
import { Link } from 'react-router'
import { useHasMeasurementDraft } from '@/features/add-measurement'
import { LatestMeasurements } from '@/widgets/latest-measurements'
import { MeasurementChart } from '@/widgets/measurement-chart'
import { MeasurementList } from '@/widgets/measurement-list'
import { ROUTES } from '@/shared/config'
import { buttonStyles, SegmentedControl } from '@/shared/ui'

type HistoryView = 'chart' | 'list'

const HISTORY_VIEWS: { value: HistoryView; label: string }[] = [
  { value: 'chart', label: 'График' },
  { value: 'list', label: 'Список' },
]

export const MeasurementsPage = () => {
  const hasDraft = useHasMeasurementDraft()
  const [historyView, setHistoryView] = useState<HistoryView>('chart')

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <h1 className="flex-1 text-2xl font-bold">Замеры</h1>
        <Link to={ROUTES.addMeasurement} className={buttonStyles('primary')}>
          {hasDraft ? 'Продолжить замеры' : '+ Замеры'}
        </Link>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Актуальные</h2>
        <LatestMeasurements />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">История</h2>
        <SegmentedControl
          aria-label="Вид истории"
          options={HISTORY_VIEWS}
          value={historyView}
          onChange={setHistoryView}
        />
        {historyView === 'chart' ? <MeasurementChart /> : <MeasurementList />}
      </section>
    </main>
  )
}

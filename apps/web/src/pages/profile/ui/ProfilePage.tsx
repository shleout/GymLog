import { Link } from 'react-router'
import { MeasurementList } from '@/widgets/measurement-list'
import { ProfileOverview } from '@/widgets/profile-overview'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const ProfilePage = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <Link to={ROUTES.home} aria-label="Назад к тренировкам" className={buttonStyles('ghost', 'px-3')}>
        ←
      </Link>
      <h1 className="flex-1 text-2xl font-bold">Профиль</h1>
      <Link to={ROUTES.editProfile} className={buttonStyles('secondary')}>
        Изменить
      </Link>
    </header>
    <ProfileOverview
      measurementsAction={
        <Link to={ROUTES.addMeasurement} className={buttonStyles('primary')}>
          + Замеры
        </Link>
      }
    />
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">История замеров</h2>
      <MeasurementList />
    </section>
  </main>
)

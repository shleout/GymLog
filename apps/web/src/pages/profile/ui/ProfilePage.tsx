import { Link } from 'react-router'
import { DataBackup } from '@/features/data-backup'
import { ProfileOverview } from '@/widgets/profile-overview'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const ProfilePage = () => (
  <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
    <header className="flex items-center gap-2">
      <h1 className="flex-1 text-2xl font-bold">Профиль</h1>
      <Link to={ROUTES.editProfile} className={buttonStyles('secondary')}>
        Изменить
      </Link>
    </header>
    <ProfileOverview />
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <h2 className="text-lg font-semibold">Данные</h2>
      <DataBackup />
    </section>
  </main>
)

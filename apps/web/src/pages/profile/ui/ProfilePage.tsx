import { Link } from 'react-router'
import { useExercises } from '@/entities/exercise'
import { DataBackup } from '@/features/data-backup'
import { AccountPanel } from '@/widgets/account'
import { ProfileOverview } from '@/widgets/profile-overview'
import { APP_VERSION, ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const ProfilePage = () => {
  const exerciseCount = useExercises().length

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <h1 className="flex-1 text-2xl font-bold">Профиль</h1>
        <Link to={ROUTES.editProfile} className={buttonStyles('secondary')}>
          Изменить
        </Link>
      </header>
      <ProfileOverview />
      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Упражнения</h2>
        <Link
          to={ROUTES.exercises}
          className="flex min-h-14 items-center justify-between gap-2 rounded-2xl bg-surface-muted px-4 py-3 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
        >
          <span className="font-semibold">Мои упражнения</span>
          <span className="flex items-center gap-2 text-text-muted">
            {exerciseCount}
            <span aria-hidden="true">›</span>
          </span>
        </Link>
      </section>
      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Данные</h2>
        <DataBackup />
      </section>
      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Аккаунт</h2>
        <AccountPanel />
      </section>
      <p className="text-center text-sm text-text-muted">version {APP_VERSION}</p>
    </main>
  )
}

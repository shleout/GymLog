import { Link, useNavigate } from 'react-router'
import { ProfileForm } from '@/features/edit-profile'
import { ROUTES } from '@/shared/config'
import { buttonStyles } from '@/shared/ui'

export const EditProfilePage = () => {
  const navigate = useNavigate()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link to={ROUTES.profile} aria-label="Отменить" className={buttonStyles('ghost', 'px-3')}>
          ←
        </Link>
        <h1 className="text-2xl font-bold">Редактирование профиля</h1>
      </header>
      <ProfileForm onSuccess={() => navigate(ROUTES.profile, { replace: true })} />
    </main>
  )
}

import { Link } from 'react-router'
import { ROUTES } from '@/shared/config'

/** Entry to the admin panel, in the violet accent that marks every admin screen. */
export const AdminPanelLink = () => (
  <Link
    to={ROUTES.admin}
    className="flex min-h-14 items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5"
      >
        <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-semibold">Админ-панель</span>
      <span className="text-sm text-text-muted">Тренировки и замеры пользователей</span>
    </span>
    <span aria-hidden="true" className="text-text-muted">›</span>
  </Link>
)

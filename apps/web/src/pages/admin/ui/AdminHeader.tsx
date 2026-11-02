import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '@/shared/ui'

type AdminHeaderProps = {
  backTo: string
  backLabel: string
  title: ReactNode
  subtitle?: ReactNode
}

/**
 * Header of every admin screen. The violet «Админ-панель» eyebrow marks that the data
 * on the screen isn't the signed-in user's own and can't be edited.
 */
export const AdminHeader = ({ backTo, backLabel, title, subtitle }: AdminHeaderProps) => (
  <header className="flex items-center gap-2">
    <Link to={backTo} aria-label={backLabel} className={buttonStyles('ghost', 'px-3')}>
      ←
    </Link>
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Админ-панель</p>
      <h1 className="truncate text-2xl font-bold">{title}</h1>
      {subtitle && <p className="truncate text-sm text-text-muted">{subtitle}</p>}
    </div>
  </header>
)

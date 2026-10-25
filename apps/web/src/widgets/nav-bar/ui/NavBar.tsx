import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib'

type NavItem = {
  to: string
  label: string
  icon: ReactNode
  /** Match the path exactly, otherwise nested paths keep the tab active. */
  end?: boolean
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-6"
  >
    {children}
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  {
    to: ROUTES.home,
    label: 'Тренировки',
    end: true,
    icon: (
      <Icon>
        <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
      </Icon>
    ),
  },
  {
    to: ROUTES.exercises,
    label: 'Упражнения',
    icon: (
      <Icon>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 3 6-6" />
      </Icon>
    ),
  },
  {
    to: ROUTES.measurements,
    label: 'Замеры',
    icon: (
      <Icon>
        <rect x="2" y="8" width="20" height="8" rx="1.5" />
        <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
      </Icon>
    ),
  },
  {
    to: ROUTES.profile,
    label: 'Профиль',
    icon: (
      <Icon>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </Icon>
    ),
  },
]

type NavBarProps = {
  className?: string
}

export const NavBar = ({ className }: NavBarProps) => (
  <nav
    aria-label="Основная навигация"
    className={cn('border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]', className)}
  >
    <ul className="mx-auto flex w-full max-w-xl">
      {NAV_ITEMS.map((item) => (
        <li key={item.to} className="flex-1">
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                isActive ? 'text-primary' : 'text-text-muted hover:text-text',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)

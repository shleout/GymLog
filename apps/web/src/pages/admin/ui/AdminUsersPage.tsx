import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAdminUsers, type AdminUserSummary } from '@/entities/admin-user'
import { paths, ROUTES } from '@/shared/config'
import { normalizeName } from '@/shared/lib'
import { Input } from '@/shared/ui'
import {
  formatCount,
  formatShortDate,
  getDisplayName,
  MEASUREMENT_FORMS,
  WORKOUT_FORMS,
} from '../lib/format'
import { AdminHeader } from './AdminHeader'
import { LoadStatus } from './LoadStatus'
import { UserAvatar } from './UserAvatar'

/** The search field appears only when the list gets long enough to need it. */
const SEARCH_MIN_USERS = 6

const matches = (user: AdminUserSummary, query: string): boolean =>
  normalizeName(user.email).includes(query) ||
  (user.nickname !== null && normalizeName(user.nickname).includes(query))

export const AdminUsersPage = () => {
  const users = useAdminUsers()
  const [query, setQuery] = useState('')

  const list = users.data
  const normalizedQuery = normalizeName(query)
  const filtered = useMemo(
    () => (list && normalizedQuery ? list.filter((user) => matches(user, normalizedQuery)) : (list ?? [])),
    [list, normalizedQuery],
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <AdminHeader
        backTo={ROUTES.profile}
        backLabel="Назад к профилю"
        title="Пользователи"
        subtitle={users.data ? `Всего: ${users.data.length}` : undefined}
      />

      <LoadStatus resource={users} onRetry={users.reload} />

      {list && list.length >= SEARCH_MIN_USERS && (
        <Input
          type="search"
          placeholder="Поиск по нику или email"
          aria-label="Поиск пользователя"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}

      {list && filtered.length === 0 && (
        <p className="py-8 text-center text-text-muted">
          {list.length === 0 ? 'Пользователей пока нет' : 'Никого не нашлось'}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {filtered.map((user) => (
          <li key={user.id}>
            <Link
              to={paths.adminUser(user.id)}
              className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 transition-colors hover:bg-surface-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-surface-muted/60"
            >
              <UserAvatar name={getDisplayName(user)} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold">{getDisplayName(user)}</span>
                  {user.role === 'admin' && (
                    <span className="shrink-0 rounded-full bg-accent/20 px-2 text-xs font-semibold text-accent">
                      админ
                    </span>
                  )}
                </span>
                {user.nickname !== null && (
                  <span className="truncate text-sm text-text-muted">{user.email}</span>
                )}
                <span className="text-sm text-text-muted">
                  {formatCount(user.workoutsCount, WORKOUT_FORMS)} ·{' '}
                  {formatCount(user.measurementsCount, MEASUREMENT_FORMS)}
                </span>
                <span className="text-xs text-text-muted">
                  {user.lastWorkoutDate
                    ? `Последняя тренировка ${formatShortDate(user.lastWorkoutDate)}`
                    : `Регистрация ${formatShortDate(user.createdAt)}`}
                </span>
              </div>
              <span aria-hidden="true" className="text-text-muted">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

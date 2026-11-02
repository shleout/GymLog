import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { ApiError } from '@/shared/api'
import { fetchAdminUserData, fetchAdminUsers } from '../api/adminUserApi'
import type { AdminUserData, AdminUserSummary, Resource } from './types'

type AdminUserState = {
  users: Resource<AdminUserSummary[]>
  /** By user id. */
  userData: Record<string, Resource<AdminUserData>>
}

type AdminUserActions = {
  loadUsers: () => Promise<void>
  loadUserData: (userId: string) => Promise<void>
  /** Drops everything loaded: called when the signed-in user changes. */
  reset: () => void
}

export type AdminUserStore = AdminUserState & AdminUserActions

const IDLE: Resource<never> = { data: null, status: 'idle', error: null }

const errorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.status === 403 ? 'Нет прав администратора' : error.message
  }
  console.warn('[admin] Request failed', error)
  return 'Не удалось загрузить данные'
}

/**
 * Other users' data for the admin panel. Not persisted and never synced: it's a read-only
 * cache of the server, kept in memory so going back and forth between screens is instant.
 * Each screen still reloads on open, showing the cached data meanwhile.
 */
export const useAdminUserStore = create<AdminUserStore>()((set, get) => {
  const load = async <T>(
    current: () => Resource<T>,
    update: (resource: Resource<T>) => void,
    request: () => Promise<T>,
  ): Promise<void> => {
    const resource = current()
    if (resource.status === 'loading') return
    update({ ...resource, status: 'loading', error: null })
    try {
      update({ data: await request(), status: 'ready', error: null })
    } catch (error) {
      update({ ...current(), status: 'error', error: errorMessage(error) })
    }
  }

  return {
    users: IDLE,
    userData: {},
    loadUsers: () =>
      load(
        () => get().users,
        (users) => set({ users }),
        fetchAdminUsers,
      ),
    loadUserData: (userId) =>
      load(
        () => get().userData[userId] ?? IDLE,
        (resource) => set((state) => ({ userData: { ...state.userData, [userId]: resource } })),
        () => fetchAdminUserData(userId),
      ),
    reset: () => set({ users: IDLE, userData: {} }),
  }
})

/** The user list, (re)loaded when the screen opens. */
export const useAdminUsers = (): Resource<AdminUserSummary[]> & { reload: () => void } => {
  const users = useAdminUserStore((state) => state.users)
  const loadUsers = useAdminUserStore((state) => state.loadUsers)
  useEffect(() => {
    void loadUsers()
  }, [loadUsers])
  return { ...users, reload: () => void loadUsers() }
}

type UserDataOptions = {
  /**
   * `true` (default) — reload on open, for the user's overview. `false` — use the cache and
   * load only if it's empty: drill-down screens opened from the overview, which just loaded it.
   */
  refresh?: boolean
}

/** One user's profile, workouts and measurements. */
export const useAdminUserData = (
  userId: string | undefined,
  { refresh = true }: UserDataOptions = {},
): Resource<AdminUserData> & { reload: () => void } => {
  const resource = useAdminUserStore((state) => (userId ? state.userData[userId] : undefined)) ?? IDLE
  const loadUserData = useAdminUserStore((state) => state.loadUserData)
  const reload = useCallback(() => {
    if (userId) void loadUserData(userId)
  }, [userId, loadUserData])
  useEffect(() => {
    if (!userId) return
    const cached = useAdminUserStore.getState().userData[userId]
    if (refresh || !cached?.data) void loadUserData(userId)
  }, [userId, refresh, loadUserData])
  return { ...resource, reload }
}

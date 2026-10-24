import { AuthResponseSchema, type AuthResponse } from '@gymlog/schemas'
import { z } from 'zod'
import {
  ApiError,
  isNetworkError,
  publicRequest,
  refreshSession,
  setAccessToken,
  setSessionListeners,
} from '@/shared/api'
import { useSessionStore } from '../model/store'
import type { Credentials } from '../model/types'

const startSession = ({ accessToken, user }: AuthResponse): void => {
  setAccessToken(accessToken)
  useSessionStore.getState().setUser(user)
}

const endSession = (): void => {
  setAccessToken(null)
  useSessionStore.getState().clearSession()
}

export const login = async (credentials: Credentials): Promise<void> =>
  startSession(
    await publicRequest('/auth/login', { method: 'POST', body: credentials, schema: AuthResponseSchema }),
  )

export const register = async (credentials: Credentials): Promise<void> =>
  startSession(
    await publicRequest('/auth/register', { method: 'POST', body: credentials, schema: AuthResponseSchema }),
  )

/** Signs out locally even offline; the server revokes the refresh token when reachable. */
export const logout = async (): Promise<void> => {
  try {
    await publicRequest('/auth/logout', { method: 'POST', schema: z.undefined() })
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    console.warn('[auth] Logout request failed, signing out locally', error)
  }
  endSession()
}

/**
 * Called once at startup. The app opens right away from the persisted user, and this
 * validates the session in the background: only a definitive 401 signs the user out
 * (via `onExpired`); an offline start keeps working with local data.
 */
export const initSession = (): void => {
  setSessionListeners({
    onRefreshed: ({ user }) => useSessionStore.getState().setUser(user),
    onExpired: endSession,
  })
  if (!useSessionStore.getState().user) return
  refreshSession().catch((error: unknown) => {
    if (isNetworkError(error)) return
    if (error instanceof ApiError && error.status === 401) return // already handled by onExpired
    console.warn('[auth] Session refresh failed', error)
  })
}

import { Navigate, Outlet, useLocation } from 'react-router'
import { z } from 'zod'
import { useCurrentUser, useIsAdmin } from '@/entities/session'
import { ForeignDataPrompt, useForeignDataOwner } from '@/features/sync'
import { ROUTES } from '@/shared/config'

const RedirectStateSchema = z.object({ from: z.string().startsWith('/') })

/** The app is only for signed-in users; anyone else is sent to the login screen. */
export const RequireAuth = () => {
  const user = useCurrentUser()
  const foreignOwner = useForeignDataOwner()
  const location = useLocation()
  if (user) return foreignOwner ? <ForeignDataPrompt /> : <Outlet />
  const from = location.pathname + location.search
  return <Navigate to={ROUTES.login} replace state={{ from }} />
}

/**
 * Admin panel. Only hides the screens from other users: the API checks the role on every
 * request anyway. Inside RequireAuth, so the user is signed in here.
 */
export const RequireAdmin = () => {
  const isAdmin = useIsAdmin()
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.profile} replace />
}

/** Login screen: once signed in, go back to where the user was heading. */
export const RequireGuest = () => {
  const user = useCurrentUser()
  const location = useLocation()
  if (!user) return <Outlet />
  const state = RedirectStateSchema.safeParse(location.state)
  return <Navigate to={state.success ? state.data.from : ROUTES.home} replace />
}

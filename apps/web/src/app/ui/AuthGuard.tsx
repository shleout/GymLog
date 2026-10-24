import { Navigate, Outlet, useLocation } from 'react-router'
import { z } from 'zod'
import { useCurrentUser } from '@/entities/session'
import { ROUTES } from '@/shared/config'

const RedirectStateSchema = z.object({ from: z.string().startsWith('/') })

/** The app is only for signed-in users; anyone else is sent to the login screen. */
export const RequireAuth = () => {
  const user = useCurrentUser()
  const location = useLocation()
  if (user) return <Outlet />
  const from = location.pathname + location.search
  return <Navigate to={ROUTES.login} replace state={{ from }} />
}

/** Login screen: once signed in, go back to where the user was heading. */
export const RequireGuest = () => {
  const user = useCurrentUser()
  const location = useLocation()
  if (!user) return <Outlet />
  const state = RedirectStateSchema.safeParse(location.state)
  return <Navigate to={state.success ? state.data.from : ROUTES.home} replace />
}

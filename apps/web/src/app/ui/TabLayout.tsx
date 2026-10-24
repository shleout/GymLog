import { Outlet } from 'react-router'
import { NavBar } from '@/widgets/nav-bar'

/**
 * Layout for top-level screens: page content plus the bottom tab bar.
 * Forms and drill-down screens live outside it, so the bar doesn't distract
 * from input and doesn't invite leaving an unsaved draft.
 */
export const TabLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <Outlet />
    <NavBar className="sticky bottom-0 mt-auto" />
  </div>
)

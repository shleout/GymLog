import { RouterProvider } from 'react-router/dom'
import { initSession } from '@/entities/session'
import { startSync } from '@/features/sync'
import { router } from './router/router'

// Module level, not an effect: runs once even under StrictMode's double mount.
initSession()
startSync()

export const App = () => <RouterProvider router={router} />

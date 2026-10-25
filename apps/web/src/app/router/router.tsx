import { createBrowserRouter } from 'react-router'
import { AddMeasurementPage } from '@/pages/add-measurement'
import { AddWorkoutPage } from '@/pages/add-workout'
import { EditProfilePage } from '@/pages/edit-profile'
import { EditWorkoutPage } from '@/pages/edit-workout'
import { ExercisesPage } from '@/pages/exercises'
import { LoginPage } from '@/pages/login'
import { MeasurementDetailsPage } from '@/pages/measurement-details'
import { MeasurementsPage } from '@/pages/measurements'
import { ProfilePage } from '@/pages/profile'
import { WorkoutDetailsPage } from '@/pages/workout-details'
import { WorkoutHistoryPage } from '@/pages/workout-history'
import { ROUTES } from '@/shared/config'
import { RequireAuth, RequireGuest } from '../ui/AuthGuard'
import { TabLayout } from '../ui/TabLayout'

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <TabLayout />,
        children: [
          { path: ROUTES.home, element: <WorkoutHistoryPage /> },
          { path: ROUTES.measurements, element: <MeasurementsPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
          { path: '*', element: <WorkoutHistoryPage /> },
        ],
      },
      { path: ROUTES.addWorkout, element: <AddWorkoutPage /> },
      { path: ROUTES.workout, element: <WorkoutDetailsPage /> },
      { path: ROUTES.editWorkout, element: <EditWorkoutPage /> },
      { path: ROUTES.editProfile, element: <EditProfilePage /> },
      { path: ROUTES.exercises, element: <ExercisesPage /> },
      { path: ROUTES.addMeasurement, element: <AddMeasurementPage /> },
      { path: ROUTES.measurement, element: <MeasurementDetailsPage /> },
    ],
  },
])

import { createBrowserRouter } from 'react-router'
import { AddMeasurementPage } from '@/pages/add-measurement'
import { AdminMeasurementPage, AdminUserPage, AdminUsersPage, AdminWorkoutPage } from '@/pages/admin'
import { AddWorkoutPage } from '@/pages/add-workout'
import { EditProfilePage } from '@/pages/edit-profile'
import { EditWorkoutPage } from '@/pages/edit-workout'
import { ExerciseDetailsPage } from '@/pages/exercise-details'
import { ExercisesPage } from '@/pages/exercises'
import { LoginPage } from '@/pages/login'
import { MeasurementDetailsPage } from '@/pages/measurement-details'
import { MeasurementsPage } from '@/pages/measurements'
import { ProfilePage } from '@/pages/profile'
import { ProgressPage } from '@/pages/progress'
import { WorkoutDetailsPage } from '@/pages/workout-details'
import { WorkoutHistoryPage } from '@/pages/workout-history'
import { ROUTES } from '@/shared/config'
import { RequireAdmin, RequireAuth, RequireGuest } from '../ui/AuthGuard'
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
          { path: ROUTES.progress, element: <ProgressPage /> },
          { path: ROUTES.measurements, element: <MeasurementsPage /> },
          { path: ROUTES.exercises, element: <ExercisesPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
          { path: '*', element: <WorkoutHistoryPage /> },
        ],
      },
      { path: ROUTES.addWorkout, element: <AddWorkoutPage /> },
      { path: ROUTES.workout, element: <WorkoutDetailsPage /> },
      { path: ROUTES.editWorkout, element: <EditWorkoutPage /> },
      { path: ROUTES.editProfile, element: <EditProfilePage /> },
      { path: ROUTES.exercise, element: <ExerciseDetailsPage /> },
      { path: ROUTES.addMeasurement, element: <AddMeasurementPage /> },
      { path: ROUTES.measurement, element: <MeasurementDetailsPage /> },
      {
        element: <RequireAdmin />,
        children: [
          { path: ROUTES.admin, element: <AdminUsersPage /> },
          { path: ROUTES.adminUser, element: <AdminUserPage /> },
          { path: ROUTES.adminWorkout, element: <AdminWorkoutPage /> },
          { path: ROUTES.adminMeasurement, element: <AdminMeasurementPage /> },
        ],
      },
    ],
  },
])

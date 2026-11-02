/** Route patterns for the router. Use `paths` to build concrete links. */
export const ROUTES = {
  home: '/',
  addWorkout: '/workouts/new',
  workout: '/workouts/:workoutId',
  editWorkout: '/workouts/:workoutId/edit',
  measurements: '/measurements',
  addMeasurement: '/measurements/new',
  measurement: '/measurements/:measurementId',
  profile: '/profile',
  editProfile: '/profile/edit',
  exercises: '/exercises',
  exercise: '/exercises/:exerciseId',
  login: '/login',
  admin: '/admin',
  adminUser: '/admin/users/:userId',
  adminWorkout: '/admin/users/:userId/workouts/:workoutId',
  adminMeasurement: '/admin/users/:userId/measurements/:measurementId',
} as const

/** Sections of an admin user page, kept in `?view=` so «←» from a detail screen returns to it. */
export type AdminUserView = 'workouts' | 'measurements'

export const paths = {
  workout: (workoutId: string) => `/workouts/${encodeURIComponent(workoutId)}`,
  editWorkout: (workoutId: string) => `/workouts/${encodeURIComponent(workoutId)}/edit`,
  measurement: (measurementId: string) => `/measurements/${encodeURIComponent(measurementId)}`,
  exercise: (exerciseId: string) => `/exercises/${encodeURIComponent(exerciseId)}`,
  adminUser: (userId: string, view: AdminUserView = 'workouts') =>
    `/admin/users/${encodeURIComponent(userId)}${view === 'workouts' ? '' : `?view=${view}`}`,
  adminWorkout: (userId: string, workoutId: string) =>
    `/admin/users/${encodeURIComponent(userId)}/workouts/${encodeURIComponent(workoutId)}`,
  adminMeasurement: (userId: string, measurementId: string) =>
    `/admin/users/${encodeURIComponent(userId)}/measurements/${encodeURIComponent(measurementId)}`,
}

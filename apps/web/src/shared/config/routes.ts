/** Route patterns for the router. Use `paths` to build concrete links. */
export const ROUTES = {
  home: '/',
  addWorkout: '/workouts/new',
  workout: '/workouts/:workoutId',
  editWorkout: '/workouts/:workoutId/edit',
  profile: '/profile',
  editProfile: '/profile/edit',
  addMeasurement: '/profile/measurements/new',
  measurement: '/profile/measurements/:measurementId',
} as const

export const paths = {
  workout: (workoutId: string) => `/workouts/${encodeURIComponent(workoutId)}`,
  editWorkout: (workoutId: string) => `/workouts/${encodeURIComponent(workoutId)}/edit`,
  measurement: (measurementId: string) =>
    `/profile/measurements/${encodeURIComponent(measurementId)}`,
}

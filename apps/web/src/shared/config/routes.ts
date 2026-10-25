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
} as const

export const paths = {
  workout: (workoutId: string) => `/workouts/${encodeURIComponent(workoutId)}`,
  editWorkout: (workoutId: string) => `/workouts/${encodeURIComponent(workoutId)}/edit`,
  measurement: (measurementId: string) => `/measurements/${encodeURIComponent(measurementId)}`,
  exercise: (exerciseId: string) => `/exercises/${encodeURIComponent(exerciseId)}`,
}

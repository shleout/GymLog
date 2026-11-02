import { z } from 'zod'
import { UserRoleSchema } from './auth.js'
import { ExerciseSchema } from './exercise.js'
import { MeasurementSchema } from './measurement.js'
import { ProfileSchema } from './profile.js'
import { TimestampSchema } from './syncMeta.js'
import { WorkoutSchema } from './workout.js'

// Admin panel: read-only view of other users' data. Counts and lists include active
// records only (deletedAt = null) — tombstones matter for sync, not for viewing.

/** `GET /admin/users/:userId` path parameter. */
export const AdminUserIdSchema = z.uuid('Некорректный id пользователя')

/** A row in the admin's user list. */
export const AdminUserSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  /** `null` — the profile was never edited. */
  nickname: z.string().nullable(),
  /** Registration time. */
  createdAt: TimestampSchema,
  workoutsCount: z.number().int(),
  measurementsCount: z.number().int(),
  /** Date of the latest workout; `null` — no workouts yet. */
  lastWorkoutDate: TimestampSchema.nullable(),
})

/** Users who trained most recently first, then those without workouts — newest sign-ups first. */
export const AdminUsersResponseSchema = z.array(AdminUserSummarySchema)

/**
 * Everything needed to show one user's history. Exercises include deleted ones: workouts
 * still reference them, and the name is all the admin view needs.
 */
export const AdminUserDataSchema = z.object({
  user: AdminUserSummarySchema,
  profile: ProfileSchema.nullable(),
  workouts: z.array(WorkoutSchema),
  exercises: z.array(ExerciseSchema),
  measurements: z.array(MeasurementSchema),
})

export type AdminUserSummary = z.infer<typeof AdminUserSummarySchema>
export type AdminUserData = z.infer<typeof AdminUserDataSchema>

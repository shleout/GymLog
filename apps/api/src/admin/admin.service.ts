import { Injectable, NotFoundException } from '@nestjs/common'
import type { AdminUserData, AdminUserSummary, UserRole } from '@gymlog/schemas'
import { PrismaService } from '../prisma/prisma.service.js'
import { exerciseFromRow, measurementFromRow, profileFromRow, workoutFromRow } from '../sync/records.js'

const ACTIVE = { deletedAt: null }

type SummaryInput = {
  id: string
  email: string
  role: UserRole
  createdAt: Date
  nickname: string | undefined
  workoutsCount: number
  measurementsCount: number
  lastWorkoutDate: Date | null
}

const toSummary = (input: SummaryInput): AdminUserSummary => ({
  id: input.id,
  email: input.email,
  role: input.role,
  // An empty nickname is "not set" too.
  nickname: input.nickname || null,
  createdAt: input.createdAt.toISOString(),
  workoutsCount: input.workoutsCount,
  measurementsCount: input.measurementsCount,
  lastWorkoutDate: input.lastWorkoutDate?.toISOString() ?? null,
})

const byRecentActivity = (a: AdminUserSummary, b: AdminUserSummary): number => {
  if (a.lastWorkoutDate !== b.lastWorkoutDate) {
    if (a.lastWorkoutDate === null) return 1
    if (b.lastWorkoutDate === null) return -1
    return b.lastWorkoutDate.localeCompare(a.lastWorkoutDate)
  }
  return b.createdAt.localeCompare(a.createdAt)
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(): Promise<AdminUserSummary[]> {
    const [users, lastWorkouts] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { nickname: true } },
          _count: { select: { workouts: { where: ACTIVE }, measurements: { where: ACTIVE } } },
        },
      }),
      this.prisma.workout.groupBy({ by: ['userId'], where: ACTIVE, _max: { date: true } }),
    ])
    const lastWorkoutDates = new Map(lastWorkouts.map((row) => [row.userId, row._max.date]))

    return users
      .map((user) =>
        toSummary({
          ...user,
          nickname: user.profile?.nickname,
          workoutsCount: user._count.workouts,
          measurementsCount: user._count.measurements,
          lastWorkoutDate: lastWorkoutDates.get(user.id) ?? null,
        }),
      )
      .sort(byRecentActivity)
  }

  async getUserData(userId: string): Promise<AdminUserData> {
    const [user, workouts, exercises, measurements] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      this.prisma.workout.findMany({ where: { userId, ...ACTIVE } }),
      this.prisma.exercise.findMany({ where: { userId } }),
      this.prisma.measurement.findMany({ where: { userId, ...ACTIVE } }),
    ])
    if (!user) throw new NotFoundException('Пользователь не найден')

    const lastWorkoutDate = workouts.reduce<Date | null>(
      (latest, workout) => (latest === null || workout.date > latest ? workout.date : latest),
      null,
    )

    return {
      user: toSummary({
        ...user,
        nickname: user.profile?.nickname,
        workoutsCount: workouts.length,
        measurementsCount: measurements.length,
        lastWorkoutDate,
      }),
      profile: user.profile ? profileFromRow(user.profile) : null,
      workouts: workouts.map(workoutFromRow),
      exercises: exercises.map(exerciseFromRow),
      measurements: measurements.map(measurementFromRow),
    }
  }
}

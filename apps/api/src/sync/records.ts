import {
  MeasurementValueSchema,
  WorkoutEntrySchema,
  type Exercise,
  type Measurement,
  type Profile,
  type Workout,
} from '@gymlog/schemas'
import type {
  Exercise as ExerciseRow,
  Measurement as MeasurementRow,
  Prisma,
  Profile as ProfileRow,
  Workout as WorkoutRow,
} from '../generated/prisma/client.js'

// Mapping between API records (@gymlog/schemas: ISO strings, optional fields)
// and DB rows (Date, nullable columns, Json).

const toDate = (iso: string): Date => new Date(iso)
const toIso = (date: Date): string => date.toISOString()
const toIsoOrNull = (date: Date | null): string | null => (date ? toIso(date) : null)

/** Optional record fields are absent, not `undefined`, so they don't appear in JSON at all. */
const optional = <K extends string, V>(key: K, value: V | null): { [P in K]?: V } =>
  (value === null ? {} : { [key]: value }) as { [P in K]?: V }

const WorkoutEntriesSchema = WorkoutEntrySchema.array()
const MeasurementValuesSchema = MeasurementValueSchema.array()

export const workoutToRow = (workout: Workout) => ({
  date: toDate(workout.date),
  entries: workout.entries as Prisma.InputJsonValue,
  note: workout.note ?? null,
  createdAt: toDate(workout.createdAt),
  updatedAt: toDate(workout.updatedAt),
  deletedAt: workout.deletedAt === null ? null : toDate(workout.deletedAt),
})

export const workoutFromRow = (row: WorkoutRow): Workout => ({
  id: row.id,
  date: toIso(row.date),
  // Json columns come back as `unknown`-ish JsonValue; parse instead of casting.
  entries: WorkoutEntriesSchema.parse(row.entries),
  ...optional('note', row.note),
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
  deletedAt: toIsoOrNull(row.deletedAt),
})

export const exerciseToRow = (exercise: Exercise) => ({
  name: exercise.name,
  muscleGroup: exercise.muscleGroup ?? null,
  createdAt: toDate(exercise.createdAt),
  updatedAt: toDate(exercise.updatedAt),
  deletedAt: exercise.deletedAt === null ? null : toDate(exercise.deletedAt),
})

export const exerciseFromRow = (row: ExerciseRow): Exercise => ({
  id: row.id,
  name: row.name,
  ...optional('muscleGroup', row.muscleGroup),
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
  deletedAt: toIsoOrNull(row.deletedAt),
})

export const measurementToRow = (measurement: Measurement) => ({
  date: toDate(measurement.date),
  weight: measurement.weight ?? null,
  values: measurement.values as Prisma.InputJsonValue,
  createdAt: toDate(measurement.createdAt),
  updatedAt: toDate(measurement.updatedAt),
  deletedAt: measurement.deletedAt === null ? null : toDate(measurement.deletedAt),
})

export const measurementFromRow = (row: MeasurementRow): Measurement => ({
  id: row.id,
  date: toIso(row.date),
  ...optional('weight', row.weight),
  values: MeasurementValuesSchema.parse(row.values),
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
  deletedAt: toIsoOrNull(row.deletedAt),
})

export const profileToRow = (profile: Profile) => ({
  nickname: profile.nickname,
  height: profile.height ?? null,
  updatedAt: profile.updatedAt === null ? null : toDate(profile.updatedAt),
})

export const profileFromRow = (row: ProfileRow): Profile => ({
  nickname: row.nickname,
  ...optional('height', row.height),
  updatedAt: toIsoOrNull(row.updatedAt),
})

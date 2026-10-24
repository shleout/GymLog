import { z } from 'zod'
import { ExerciseSchema } from '@/entities/exercise'
import { MeasurementSchema } from '@/entities/measurement'
import { ProfileSchema } from '@/entities/profile'
import { WorkoutSchema } from '@/entities/workout'

/** Bump when the backup format changes; old files then need a migration on import. */
export const BACKUP_VERSION = 1

export const BackupSchema = z.object({
  app: z.literal('gymlog', { error: 'Это не файл резервной копии GymLog' }),
  version: z.literal(BACKUP_VERSION, { error: 'Неподдерживаемая версия резервной копии' }),
  exportedAt: z.iso.datetime({ offset: true }),
  data: z.object({
    // Deleted records (tombstones) are included: the backup is a full copy of the local state.
    workouts: z.array(WorkoutSchema),
    exercises: z.array(ExerciseSchema),
    measurements: z.array(MeasurementSchema),
    profile: ProfileSchema,
  }),
})

export type Backup = z.infer<typeof BackupSchema>

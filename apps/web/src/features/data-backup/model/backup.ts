import { format } from 'date-fns'
import { useExerciseStore } from '@/entities/exercise'
import { useMeasurementStore } from '@/entities/measurement'
import { useProfileStore } from '@/entities/profile'
import { useWorkoutStore } from '@/entities/workout'
import { nowIso } from '@/shared/lib'
import { BACKUP_VERSION, BackupSchema, type Backup } from './backupSchema'

export const createBackup = (): Backup => ({
  app: 'gymlog',
  version: BACKUP_VERSION,
  exportedAt: nowIso(),
  data: {
    workouts: useWorkoutStore.getState().workouts,
    exercises: useExerciseStore.getState().exercises,
    measurements: useMeasurementStore.getState().measurements,
    profile: useProfileStore.getState().profile,
  },
})

/** Saves the backup as a JSON file via a temporary object URL. */
export const downloadBackup = (backup: Backup): void => {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gymlog-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  link.click()
  // Revoke on the next tick: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export type ParseBackupResult = { ok: true; backup: Backup } | { ok: false; error: string }

export const parseBackupFile = async (file: File): Promise<ParseBackupResult> => {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    return { ok: false, error: 'Файл не является корректным JSON' }
  }
  const result = BackupSchema.safeParse(data)
  if (!result.success) {
    const { issues } = result.error
    const headerIssue = issues.find((issue) => issue.path[0] === 'app' || issue.path[0] === 'version')
    if (headerIssue) return { ok: false, error: headerIssue.message }
    const [issue] = issues
    return { ok: false, error: `Файл повреждён: ${issue.message} (${issue.path.map(String).join('.')})` }
  }
  return { ok: true, backup: result.data }
}

/** Replaces all local data. `setState` goes through `persist`, so the data is saved right away. */
export const restoreBackup = ({ data }: Backup): void => {
  useWorkoutStore.setState({ workouts: data.workouts })
  useExerciseStore.setState({ exercises: data.exercises })
  useMeasurementStore.setState({ measurements: data.measurements })
  useProfileStore.setState({ profile: data.profile })
}

export const getBackupSummary = ({ data }: Backup) => ({
  workouts: data.workouts.filter((workout) => workout.deletedAt === null).length,
  measurements: data.measurements.filter((measurement) => measurement.deletedAt === null).length,
})

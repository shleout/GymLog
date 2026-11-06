import { RELIABLE_ESTIMATE_MAX_REPS, type ExerciseProgress, type ProgressPoint } from '@/entities/workout'
import { formatDuration, formatNumber } from '@/shared/lib'

/**
 * `≈ 24 кг` for an estimate from many reps, `35 кг`, `12 повт.` for a bodyweight exercise,
 * or `1:30` for a hold.
 */
export const formatProgressValue = (point: ProgressPoint, kind: ExerciseProgress['kind']): string => {
  if (kind === 'time') return formatDuration(point.value)
  if (kind === 'reps') return `${point.value} повт.`
  const approximate = (point.set.reps ?? 0) > RELIABLE_ESTIMATE_MAX_REPS ? '≈ ' : ''
  return `${approximate}${formatNumber(point.value)} кг`
}

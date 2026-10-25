import { RELIABLE_ESTIMATE_MAX_REPS, type ExerciseProgress, type ProgressPoint } from '@/entities/workout'
import { formatNumber } from '@/shared/lib'

/** `≈ 24 кг` for an estimate from many reps, `35 кг`, or `12 повт.` for a bodyweight exercise. */
export const formatProgressValue = (point: ProgressPoint, kind: ExerciseProgress['kind']): string => {
  if (kind === 'reps') return `${point.value} повт.`
  const approximate = point.set.reps > RELIABLE_ESTIMATE_MAX_REPS ? '≈ ' : ''
  return `${approximate}${formatNumber(point.value)} кг`
}

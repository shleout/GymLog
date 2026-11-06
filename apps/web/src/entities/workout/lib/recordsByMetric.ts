import type { ExerciseSession } from './getExerciseSessions'

/** What a set is measured by besides weight: reps of a regular set, seconds of a timed one. */
export type SetMetric = 'reps' | 'durationSec'

export type MetricRecord = {
  value: number
  /** kg; 0 is never stored — bodyweight records come from `getUnweightedRecords`. */
  weight: number
  /** The first workout where this record was set. */
  workoutId: string
  date: string
}

export type UnweightedRecord = Pick<MetricRecord, 'value' | 'workoutId' | 'date'>

/** Weighted sets oldest first, so that among equal sets the first one wins. */
const getWeightedSets = (sessions: ExerciseSession[], metric: SetMetric): MetricRecord[] =>
  [...sessions].reverse().flatMap((session) =>
    session.sets.flatMap((set) => {
      const value = set[metric]
      return set.weight === undefined || value === undefined
        ? []
        : [{ value, weight: set.weight, workoutId: session.workoutId, date: session.date }]
    }),
  )

/**
 * Records that no other set beats in both weight and metric, sorted by metric ascending
 * (so weight goes down). A set like 18×8 is dropped when there is 20×10: the latter
 * is heavier and longer at once. The same goes for holds: 15 kg × 30 s covers 10 kg × 20 s.
 */
export const getWeightedRecords = (
  sessions: ExerciseSession[],
  metric: SetMetric,
): MetricRecord[] => {
  const bestByValue = new Map<number, MetricRecord>()
  for (const set of getWeightedSets(sessions, metric)) {
    const current = bestByValue.get(set.value)
    if (!current || set.weight > current.weight) bestByValue.set(set.value, set)
  }

  const records: MetricRecord[] = []
  let heavierWithMore = 0
  for (const record of [...bestByValue.values()].sort((a, b) => b.value - a.value)) {
    if (record.weight > heavierWithMore) {
      records.push(record)
      heavierWithMore = record.weight
    }
  }
  return records.reverse()
}

/**
 * Records of the metric in one set without weight, newest (current) first: every time
 * the previous best was beaten. Weighted sets don't count — they are not comparable.
 */
export const getUnweightedRecords = (
  sessions: ExerciseSession[],
  metric: SetMetric,
): UnweightedRecord[] => {
  const records: UnweightedRecord[] = []
  let best = 0
  for (const session of [...sessions].reverse()) {
    for (const set of session.sets) {
      const value = set[metric]
      if (set.weight !== undefined || value === undefined || value <= best) continue
      best = value
      // Several records within one workout: keep only its best.
      if (records.at(-1)?.workoutId === session.workoutId) records.pop()
      records.push({ value, workoutId: session.workoutId, date: session.date })
    }
  }
  return records.reverse()
}

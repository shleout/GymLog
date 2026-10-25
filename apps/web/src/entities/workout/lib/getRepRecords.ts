import type { ExerciseSession } from './getExerciseSessions'

export type RepRecord = {
  reps: number
  /** kg */
  weight: number
  /** The first workout where this record was set. */
  workoutId: string
  date: string
}

type WeightedSet = RepRecord

/** Weighted sets oldest first, so that among equal sets the first one wins. */
const getWeightedSets = (sessions: ExerciseSession[]): WeightedSet[] =>
  [...sessions].reverse().flatMap((session) =>
    session.sets.flatMap((set) =>
      set.weight === undefined
        ? []
        : [{ reps: set.reps, weight: set.weight, workoutId: session.workoutId, date: session.date }],
    ),
  )

/**
 * Records that no other set beats in both weight and reps, sorted by reps ascending
 * (so weight goes down). A set like 18×8 is dropped when there is 20×10: the latter
 * is heavier and longer at once.
 */
export const getRepRecords = (sessions: ExerciseSession[]): RepRecord[] => {
  const bestByReps = new Map<number, WeightedSet>()
  for (const set of getWeightedSets(sessions)) {
    const current = bestByReps.get(set.reps)
    if (!current || set.weight > current.weight) bestByReps.set(set.reps, set)
  }

  const records: RepRecord[] = []
  let heavierWithMoreReps = 0
  for (const record of [...bestByReps.values()].sort((a, b) => b.reps - a.reps)) {
    if (record.weight > heavierWithMoreReps) {
      records.push(record)
      heavierWithMoreReps = record.weight
    }
  }
  return records.reverse()
}

/** The heaviest set with at least `reps` reps: if you did 20×10, you can do 20×8 as well. */
export const getRepRecord = (sessions: ExerciseSession[], reps: number): RepRecord | undefined =>
  getRepRecords(sessions).find((record) => record.reps >= reps)

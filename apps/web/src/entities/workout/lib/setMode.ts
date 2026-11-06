import type { Set } from '../model/types'
import type { ExerciseSession } from './getExerciseSessions'

/**
 * How a set is measured: `reps` — by repetitions, `time` — by hold duration. The same exercise
 * can be done both ways (weighted pull-up for reps one day, a hold the next), so the mode
 * belongs to the set, not to the exercise.
 */
export type SetMode = 'reps' | 'time'

export const SET_MODES: readonly SetMode[] = ['reps', 'time']

export const getSetMode = (set: Pick<Set, 'durationSec'>): SetMode =>
  set.durationSec === undefined ? 'reps' : 'time'

/** Modes the sessions contain, in `SET_MODES` order. */
export const getSessionModes = (sessions: ExerciseSession[]): SetMode[] =>
  SET_MODES.filter((mode) =>
    sessions.some((session) => session.sets.some((set) => getSetMode(set) === mode)),
  )

/**
 * Sessions reduced to the sets of one mode; a session left without sets is dropped.
 * Reps and holds are not comparable, so progress and records are always computed per mode.
 */
export const filterSessionsByMode = (
  sessions: ExerciseSession[],
  mode: SetMode,
): ExerciseSession[] =>
  sessions.flatMap((session) => {
    const sets = session.sets.filter((set) => getSetMode(set) === mode)
    return sets.length > 0 ? [{ ...session, sets }] : []
  })

/** Mode of the latest session's last set: what the user did with the exercise most recently. */
export const getLatestMode = (sessions: ExerciseSession[]): SetMode | undefined => {
  const lastSet = sessions[0]?.sets.at(-1)
  return lastSet && getSetMode(lastSet)
}

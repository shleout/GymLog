import { SYNC_BATCH_LIMIT, SyncPushResponseSchema } from '@gymlog/schemas'
import { z } from 'zod'
import { ExerciseSchema, useExerciseStore } from '@/entities/exercise'
import { MeasurementSchema, useMeasurementStore } from '@/entities/measurement'
import { ProfileSchema, useProfileStore, type Profile } from '@/entities/profile'
import { useSessionStore } from '@/entities/session'
import { useSyncStore, type RejectedRecord } from '@/entities/sync'
import { useWorkoutStore, WorkoutSchema } from '@/entities/workout'
import { ApiError, apiRequest, isNetworkError } from '@/shared/api'
import { backupCorrupted, nowIso, restoreItems } from '@/shared/lib'
import { collectPending, PROFILE_KEY, recordKey, type LocalData } from './pending'

/** Pause after a local edit, so a burst of edits (sets in a row) goes out as one push. */
const LOCAL_CHANGE_DELAY_MS = 2_000
/** Picks up changes from other devices while the app is open. */
const POLL_INTERVAL_MS = 2 * 60_000
const RETRY_DELAYS_MS = [5_000, 15_000, 60_000, 5 * 60_000]
/** Guard against an endless push loop if every round leaves something pending. */
const MAX_PUSH_ROUNDS = 20
/** Where pulled records that fail validation are kept (`<key>:corrupted`). */
const PULL_BACKUP_KEY = 'gymlog-sync-pull'

/**
 * Records stay `unknown` until validated one by one, like on the server: a single record the
 * client considers invalid (e.g. a date "in the future" because of a clock difference) must not
 * fail the whole page and block the pull forever.
 */
const PullPageSchema = z.object({
  changes: z.object({
    workouts: z.array(z.unknown()),
    exercises: z.array(z.unknown()),
    measurements: z.array(z.unknown()),
    profile: z.unknown(),
  }),
  cursor: z.number().int().min(0),
  hasMore: z.boolean(),
})

const readLocalData = (): LocalData => ({
  workouts: useWorkoutStore.getState().workouts,
  exercises: useExerciseStore.getState().exercises,
  measurements: useMeasurementStore.getState().measurements,
  profile: useProfileStore.getState().profile,
})

/** Sync was started for this account; results are dropped if the user changed meanwhile. */
class SessionChangedError extends Error {}

const assertSameUser = (userId: string): void => {
  if (useSessionStore.getState().user?.id !== userId) throw new SessionChangedError()
}

const push = async (userId: string): Promise<void> => {
  for (let round = 0; round < MAX_PUSH_ROUNDS; round++) {
    const sync = useSyncStore.getState()
    const { body, versions } = collectPending(readLocalData(), sync, SYNC_BATCH_LIMIT)
    if (Object.keys(versions).length === 0) return

    const response = await apiRequest('/sync/push', {
      method: 'POST',
      body,
      schema: SyncPushResponseSchema,
    })
    assertSameUser(userId)

    const rejected: Record<string, RejectedRecord> = {}
    for (const rejection of response.rejected) {
      const key = recordKey(rejection.entity, rejection.id)
      const updatedAt = versions[key]
      console.warn(`[sync] Server rejected ${key}`, rejection.issues)
      if (updatedAt === undefined) continue
      rejected[key] = { updatedAt, issues: rejection.issues }
      delete versions[key]
    }
    // The versions that were sent, not the current ones: a record edited while the request
    // was in flight keeps a newer `updatedAt` and stays pending for the next round.
    useSyncStore.getState().markSynced(versions)
    useSyncStore.getState().markRejected(rejected)
  }
}

/** Set while pulled records are written, so the store subscriptions don't schedule a push. */
let applyingRemote = false

const applyPage = (changes: z.infer<typeof PullPageSchema>['changes']): void => {
  const workouts = restoreItems(PULL_BACKUP_KEY, changes.workouts, WorkoutSchema) ?? []
  const exercises = restoreItems(PULL_BACKUP_KEY, changes.exercises, ExerciseSchema) ?? []
  const measurements = restoreItems(PULL_BACKUP_KEY, changes.measurements, MeasurementSchema) ?? []

  let profile: Profile | null = null
  if (changes.profile !== null && changes.profile !== undefined) {
    const result = ProfileSchema.safeParse(changes.profile)
    if (result.success) profile = result.data
    else {
      console.warn('[sync] Invalid profile from the server, moved to backup')
      backupCorrupted(PULL_BACKUP_KEY, changes.profile)
    }
  }

  applyingRemote = true
  try {
    useExerciseStore.getState().applyRemoteExercises(exercises)
    useWorkoutStore.getState().applyRemoteWorkouts(workouts)
    useMeasurementStore.getState().applyRemoteMeasurements(measurements)
    if (profile) useProfileStore.getState().applyRemoteProfile(profile)
  } finally {
    applyingRemote = false
  }

  // Record what the server has, whichever side won locally: if the local copy is newer,
  // its `updatedAt` differs from this mark and it stays pending.
  const versions: Record<string, string> = {}
  for (const record of exercises) versions[recordKey('exercise', record.id)] = record.updatedAt
  for (const record of workouts) versions[recordKey('workout', record.id)] = record.updatedAt
  for (const record of measurements) versions[recordKey('measurement', record.id)] = record.updatedAt
  if (profile?.updatedAt) versions[PROFILE_KEY] = profile.updatedAt
  useSyncStore.getState().markSynced(versions)
}

const pull = async (userId: string): Promise<void> => {
  let hasMore = true
  while (hasMore) {
    const { cursor } = useSyncStore.getState()
    const page = await apiRequest(`/sync/pull?cursor=${cursor}`, { schema: PullPageSchema })
    assertSameUser(userId)
    applyPage(page.changes)
    useSyncStore.getState().setCursor(page.cursor)
    hasMore = page.hasMore
  }
}

let retryAttempt = 0
let retryTimer: ReturnType<typeof setTimeout> | undefined
let localChangeTimer: ReturnType<typeof setTimeout> | undefined

const scheduleRetry = (): void => {
  const delay = RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)]
  retryAttempt++
  retryTimer = setTimeout(requestSync, delay)
}

/** Push first: then the pull already reflects the server's verdict on our own changes. */
const syncOnce = async (): Promise<void> => {
  const user = useSessionStore.getState().user
  if (!user) return
  const sync = useSyncStore.getState()
  if (!navigator.onLine) {
    sync.setStatus('offline')
    return // the `online` event starts the next attempt
  }

  sync.setStatus('syncing')
  try {
    await push(user.id)
    await pull(user.id)
    retryAttempt = 0
    useSyncStore.getState().finishSync(nowIso())
  } catch (error) {
    // Signed out (or another account) mid-sync, or a 401 after a failed refresh:
    // the session is over and the app is back on the login screen.
    if (error instanceof SessionChangedError || (error instanceof ApiError && error.status === 401)) {
      useSyncStore.getState().setStatus('idle')
      return
    }
    if (isNetworkError(error)) useSyncStore.getState().setStatus('offline')
    else {
      console.warn('[sync] Sync failed', error)
      useSyncStore
        .getState()
        .setStatus('error', error instanceof Error ? error.message : 'Ошибка синхронизации')
    }
    scheduleRetry()
  }
}

let running: Promise<void> | null = null
let rerun = false

/**
 * Starts a sync now. Single-flight: a request during a running sync doesn't start a second
 * one in parallel, it makes the current loop run once more after it finishes.
 */
export const requestSync = (): void => {
  clearTimeout(retryTimer)
  clearTimeout(localChangeTimer)
  if (running) {
    rerun = true
    return
  }
  running = (async () => {
    do {
      rerun = false
      await syncOnce()
    } while (rerun)
  })().finally(() => {
    running = null
  })
}

const scheduleAfterLocalChange = (): void => {
  if (applyingRemote) return
  clearTimeout(localChangeTimer)
  localChangeTimer = setTimeout(requestSync, LOCAL_CHANGE_DELAY_MS)
}

const handleUser = (userId: string | undefined): void => {
  if (!userId) {
    clearTimeout(retryTimer)
    clearTimeout(localChangeTimer)
    return
  }
  // Sync metadata of another account says nothing about this one: start over,
  // which also uploads everything that is on the device.
  if (useSyncStore.getState().userId !== userId) useSyncStore.getState().resetForUser(userId)
  requestSync()
}

let started = false

/** Wires the triggers once at startup: sign-in, local edits, reconnect, return to the app, polling. */
export const startSync = (): void => {
  if (started) return
  started = true

  useWorkoutStore.subscribe(scheduleAfterLocalChange)
  useExerciseStore.subscribe(scheduleAfterLocalChange)
  useMeasurementStore.subscribe(scheduleAfterLocalChange)
  useProfileStore.subscribe(scheduleAfterLocalChange)

  useSessionStore.subscribe((state, prev) => {
    if (state.user?.id !== prev.user?.id) handleUser(state.user?.id)
  })

  window.addEventListener('online', requestSync)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') requestSync()
  })
  setInterval(() => {
    if (document.visibilityState === 'visible') requestSync()
  }, POLL_INTERVAL_MS)

  handleUser(useSessionStore.getState().user?.id)
}

import { AuthResponseSchema, type AuthResponse } from '@gymlog/schemas'
import { z } from 'zod'

/** The API lives on the same origin: Vite proxies it in dev, a Vercel rewrite in prod. */
const API_PREFIX = '/api'
/** Generous on purpose: the free Render instance needs up to a minute to wake up. */
const REQUEST_TIMEOUT_MS = 70_000
const REFRESH_LOCK = 'gymlog-auth-refresh'

/**
 * `status: 0` — the server wasn't reached (offline, timeout, proxy error page).
 * Callers must tell it apart from 401: being offline is not a reason to sign out.
 */
export class ApiError extends Error {
  readonly status: number
  /** Field-level messages from the API's ZodValidationPipe (`path: message`). */
  readonly issues: string[]

  constructor(status: number, message: string, issues: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

export const isNetworkError = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 0

const ErrorBodySchema = z.object({
  message: z.union([z.string(), z.array(z.string())]).optional(),
  issues: z.array(z.string()).optional(),
})

/**
 * In memory only: a token in localStorage would be readable by any injected script.
 * After a reload it's restored by `refreshSession` from the httpOnly refresh cookie.
 */
let accessToken: string | null = null

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

type SessionListeners = {
  onRefreshed: (session: AuthResponse) => void
  /** The refresh cookie is missing, expired or revoked: the user has to sign in again. */
  onExpired: () => void
}

let listeners: SessionListeners | null = null

/** Lets the session store follow token refreshes without shared/ depending on entities/. */
export const setSessionListeners = (value: SessionListeners): void => {
  listeners = value
}

type RequestOptions<T> = {
  method?: 'GET' | 'POST'
  body?: unknown
  schema: z.ZodType<T>
}

const send = async <T>(path: string, { method = 'GET', body, schema }: RequestOptions<T>): Promise<T> => {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(API_PREFIX + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(0, 'Нет соединения с сервером')
  }

  // The proxy answers 502/504 with an HTML page when the API is down or still booting.
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new ApiError(0, 'Сервер недоступен')
  }

  const data: unknown = response.status === 204 ? undefined : await response.json().catch(() => undefined)

  if (!response.ok) {
    const parsed = ErrorBodySchema.safeParse(data)
    const message = parsed.success ? parsed.data.message : undefined
    throw new ApiError(
      response.status,
      (Array.isArray(message) ? message[0] : message) ?? `Ошибка сервера (${response.status})`,
      parsed.success ? (parsed.data.issues ?? []) : [],
    )
  }

  const result = schema.safeParse(data)
  if (!result.success) throw new ApiError(response.status, 'Неожиданный ответ сервера')
  return result.data
}

const doRefresh = async (): Promise<AuthResponse> => {
  try {
    const session = await send('/auth/refresh', { method: 'POST', schema: AuthResponseSchema })
    accessToken = session.accessToken
    listeners?.onRefreshed(session)
    return session
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      accessToken = null
      listeners?.onExpired()
    }
    throw error
  }
}

let refreshInFlight: Promise<AuthResponse> | null = null

/**
 * New access token by the refresh cookie. Single-flight: the server rotates the refresh token
 * on every call, so a second concurrent refresh would present the already revoked token,
 * get 401 and sign the user out. Within a tab the promise is shared; across tabs (they share
 * the cookie) a Web Lock serializes the calls — the next one runs with the already rotated cookie.
 */
export const refreshSession = (): Promise<AuthResponse> => {
  refreshInFlight ??= (
    'locks' in navigator ? navigator.locks.request(REFRESH_LOCK, doRefresh) : doRefresh()
  ).finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/** Authorized request: on 401 refreshes the access token once and retries. */
export const apiRequest = async <T>(path: string, options: RequestOptions<T>): Promise<T> => {
  // A refresh is already running (e.g. the startup one): wait for its token instead of
  // sending a request that is bound to get 401.
  if (refreshInFlight) await refreshInFlight.catch(() => undefined)
  try {
    return await send(path, options)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
  }
  await refreshSession()
  return send(path, options)
}

/** Request that must not trigger a refresh: login, register, logout. */
export const publicRequest = <T>(path: string, options: RequestOptions<T>): Promise<T> =>
  send(path, options)

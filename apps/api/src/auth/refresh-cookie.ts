import type { CookieOptions, Request, Response } from 'express'
import { getEnv } from '../config/env.js'
import { API_PREFIX } from '../config/http.js'

export const REFRESH_COOKIE = 'gymlog_refresh'

/**
 * httpOnly — page scripts (and XSS) can't read the token; SameSite=Strict — the browser
 * doesn't attach it to cross-site requests, which closes CSRF on /auth/refresh.
 * Strict works because the frontend reaches the API on its own origin through a proxy.
 * The path limits the cookie to auth endpoints: it isn't sent with every sync request.
 */
const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: getEnv().COOKIE_SECURE,
  sameSite: 'strict',
  path: `/${API_PREFIX}/auth`,
})

export const setRefreshCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(), expires: expiresAt })
}

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions())
}

export const readRefreshCookie = (req: Request): string | undefined => {
  const cookies: Record<string, unknown> = req.cookies ?? {}
  const value = cookies[REFRESH_COOKIE]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

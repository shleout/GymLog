import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { AdminUserSummary } from '@/entities/admin-user'
import { pluralize } from '@/shared/lib'

/** Nickname if set, otherwise the email. */
export const getDisplayName = (user: AdminUserSummary): string => user.nickname ?? user.email

export const formatShortDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy', { locale: ru })

/** «Вторник»: starts the subtitle, so capitalized. */
export const formatWeekday = (iso: string): string => {
  const weekday = format(parseISO(iso), 'EEEE', { locale: ru })
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

export const formatCount = (count: number, forms: [string, string, string]): string =>
  `${count} ${pluralize(count, forms)}`

export const WORKOUT_FORMS: [string, string, string] = ['тренировка', 'тренировки', 'тренировок']
export const MEASUREMENT_FORMS: [string, string, string] = ['замер', 'замера', 'замеров']

import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/** `12 окт 2026` */
export const formatShortDate = (iso: string): string => format(parseISO(iso), 'd MMM yyyy', { locale: ru })

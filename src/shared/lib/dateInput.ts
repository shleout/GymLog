import { format, isValid, parse, parseISO } from 'date-fns'

/** Value format of `<input type="date">`. */
export const DATE_INPUT_FORMAT = 'yyyy-MM-dd'

export const getTodayInputValue = (): string => format(new Date(), DATE_INPUT_FORMAT)

export const isoToDateInputValue = (iso: string): string => format(parseISO(iso), DATE_INPUT_FORMAT)

/** `yyyy-MM-dd` → ISO string of local midnight, or `null` for an invalid value. */
export const dateInputValueToIso = (value: string): string | null => {
  const date = parse(value, DATE_INPUT_FORMAT, new Date())
  return isValid(date) ? date.toISOString() : null
}

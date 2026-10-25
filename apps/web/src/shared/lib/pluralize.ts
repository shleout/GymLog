const rules = new Intl.PluralRules('ru-RU')

/** Russian word form for a count: `pluralize(3, ['тренировка', 'тренировки', 'тренировок'])`. */
export const pluralize = (count: number, [one, few, many]: [string, string, string]): string => {
  const rule = rules.select(count)
  if (rule === 'one') return one
  if (rule === 'few') return few
  return many
}

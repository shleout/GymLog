const numberFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

/** `62.5` → `62,5`, `12500` → `12 500`. */
export const formatNumber = (value: number): string => numberFormat.format(value)

/** Change between two values with a sign: `+1,5`, `−0,5`, `±0`. */
export const formatDiff = (current: number, previous: number): string => {
  const diff = Math.round((current - previous) * 10) / 10
  if (diff === 0) return '±0'
  return `${diff > 0 ? '+' : '−'}${formatNumber(Math.abs(diff))}`
}

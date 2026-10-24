import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { MeasuredValue } from '@/entities/measurement'
import { formatNumber } from '@/shared/lib'

type PreviousValueProps = {
  previous?: MeasuredValue
  unit: string
}

export const PreviousValue = ({ previous, unit }: PreviousValueProps) =>
  previous ? (
    <p className="flex flex-col text-sm leading-tight">
      <span className="font-semibold text-text">
        {formatNumber(previous.value)} {unit}
      </span>
      <span className="text-text-muted">
        {format(parseISO(previous.date), 'd MMM yyyy', { locale: ru })}
      </span>
    </p>
  ) : (
    <p className="text-sm text-text-muted">Первый замер</p>
  )

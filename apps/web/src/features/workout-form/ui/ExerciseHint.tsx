import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatSet, formatSetWithRir } from '@/entities/workout'
import { formatNumber } from '@/shared/lib'
import type { ExerciseHint as Hint } from '../model/useExerciseHint'

const formatDay = (iso: string): string => format(parseISO(iso), 'd MMM', { locale: ru })

type ExerciseHintProps = {
  hint: Hint
}

export const ExerciseHint = ({ hint }: ExerciseHintProps) => {
  const { last, record, note } = hint

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-raised/60 px-3 py-2 text-sm">
      <p>
        <span className="text-text-muted">
          В прошлый раз, {formatDay(last.date)}:
        </span>{' '}
        {last.sets.map(formatSetWithRir).join(' · ')}
      </p>
      {note && (
        <p className="whitespace-pre-line">
          <span className="text-text-muted">
            {note.session === last ? 'Заметка:' : `Заметка от ${formatDay(note.session.date)}:`}
          </span>{' '}
          {note.text}
        </p>
      )}
      {record?.kind === 'reps' && (
        <p>
          <span className="text-text-muted">Рекорд за подход:</span>{' '}
          <span className="font-semibold text-primary">{record.best.reps} повт.</span>
        </p>
      )}
      {record?.kind === 'weight' && (
        <p>
          <span className="text-text-muted">Рекорд на {record.reps} повт.:</span>{' '}
          {record.best ? (
            <>
              <span className="font-semibold text-primary">{formatNumber(record.best.weight)} кг</span>
              {record.best.reps !== record.reps && (
                <span className="text-text-muted">
                  {' '}
                  ({formatSet(record.best)})
                </span>
              )}
            </>
          ) : (
            <span className="text-text-muted">столько с весом ещё не делали</span>
          )}
        </p>
      )}
    </div>
  )
}

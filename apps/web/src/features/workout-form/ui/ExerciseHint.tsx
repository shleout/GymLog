import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatSet } from '@/entities/workout'
import { formatNumber } from '@/shared/lib'
import type { ExerciseHint as Hint } from '../model/useExerciseHint'

type ExerciseHintProps = {
  hint: Hint
}

export const ExerciseHint = ({ hint }: ExerciseHintProps) => {
  const { last, record } = hint

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-raised/60 px-3 py-2 text-sm">
      <p>
        <span className="text-text-muted">
          В прошлый раз, {format(parseISO(last.date), 'd MMM', { locale: ru })}:
        </span>{' '}
        {last.sets.map(formatSet).join(' · ')}
      </p>
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

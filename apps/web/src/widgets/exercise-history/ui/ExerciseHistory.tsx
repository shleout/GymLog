import { useMemo, useState } from 'react'
import {
  getExerciseProgress,
  getExerciseSessions,
  getMaxRepsRecords,
  getRepRecords,
  useWorkouts,
} from '@/entities/workout'
import { cn } from '@/shared/lib'
import { SegmentedControl } from '@/shared/ui'
import { ExerciseSummary } from './ExerciseSummary'
import { ProgressChart } from './ProgressChart'
import { RecordsTable } from './RecordsTable'
import { SessionList } from './SessionList'

type ExerciseHistoryProps = {
  exerciseId: string
  className?: string
}

type Section = 'chart' | 'records' | 'history'

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'chart', label: 'График' },
  { value: 'records', label: 'Рекорды' },
  { value: 'history', label: 'История' },
]

/** Progress of one exercise: summary, then chart / rep records / workouts with it. */
export const ExerciseHistory = ({ exerciseId, className }: ExerciseHistoryProps) => {
  const workouts = useWorkouts()
  const [section, setSection] = useState<Section>('chart')

  const sessions = useMemo(() => getExerciseSessions(workouts, exerciseId), [workouts, exerciseId])
  const progress = useMemo(() => getExerciseProgress(sessions), [sessions])
  const repRecords = useMemo(() => getRepRecords(sessions), [sessions])
  const maxRepsRecords = useMemo(() => getMaxRepsRecords(sessions), [sessions])

  if (sessions.length === 0) {
    return (
      <p className={cn('py-12 text-center text-lg text-text-muted', className)}>
        Упражнение ещё не выполнялось. Прогресс появится после первой тренировки с ним.
      </p>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ExerciseSummary progress={progress} />
      <SegmentedControl
        aria-label="Раздел"
        options={SECTIONS}
        value={section}
        onChange={setSection}
      />
      {section === 'chart' && <ProgressChart progress={progress} />}
      {section === 'records' &&
        (progress.kind === 'weight' ? (
          <RecordsTable kind="weight" records={repRecords} />
        ) : (
          <RecordsTable kind="reps" records={maxRepsRecords} />
        ))}
      {section === 'history' && <SessionList sessions={sessions} points={progress.points} />}
    </div>
  )
}

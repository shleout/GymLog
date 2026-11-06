import { useMemo, useState } from 'react'
import {
  filterSessionsByMode,
  getExerciseProgress,
  getExerciseSessions,
  getLatestMode,
  getMaxRepsRecords,
  getMaxTimeRecords,
  getRepRecords,
  getSessionModes,
  getTimeRecords,
  useWorkouts,
  type SetMode,
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

const MODE_OPTIONS: { value: SetMode; label: string }[] = [
  { value: 'reps', label: 'Повторы' },
  { value: 'time', label: 'Время' },
]

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

  const [pickedMode, setPickedMode] = useState<SetMode>()

  const allSessions = useMemo(() => getExerciseSessions(workouts, exerciseId), [workouts, exerciseId])
  // The exercise may have been done both for reps and as a hold: they are shown separately,
  // starting with the way it was done last.
  const modes = useMemo(() => getSessionModes(allSessions), [allSessions])
  const mode = pickedMode && modes.includes(pickedMode) ? pickedMode : (getLatestMode(allSessions) ?? 'reps')
  const sessions = useMemo(() => filterSessionsByMode(allSessions, mode), [allSessions, mode])
  const progress = useMemo(() => getExerciseProgress(sessions), [sessions])
  const repRecords = useMemo(() => getRepRecords(sessions), [sessions])
  const maxRepsRecords = useMemo(() => getMaxRepsRecords(sessions), [sessions])
  const timeRecords = useMemo(() => getTimeRecords(sessions), [sessions])
  const maxTimeRecords = useMemo(() => getMaxTimeRecords(sessions), [sessions])

  if (allSessions.length === 0) {
    return (
      <p className={cn('py-12 text-center text-lg text-text-muted', className)}>
        Упражнение ещё не выполнялось. Прогресс появится после первой тренировки с ним.
      </p>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {modes.length > 1 && (
        <SegmentedControl
          aria-label="Как выполнялось"
          options={MODE_OPTIONS}
          value={mode}
          onChange={setPickedMode}
        />
      )}
      <ExerciseSummary progress={progress} />
      <SegmentedControl
        aria-label="Раздел"
        options={SECTIONS}
        value={section}
        onChange={setSection}
      />
      {section === 'chart' && <ProgressChart progress={progress} />}
      {section === 'records' && progress.kind === 'time' &&
        (timeRecords.length > 0 ? (
          <RecordsTable kind="holdWeight" records={timeRecords} />
        ) : (
          <RecordsTable kind="hold" records={maxTimeRecords} />
        ))}
      {section === 'records' && progress.kind === 'weight' && (
        <RecordsTable kind="weight" records={repRecords} />
      )}
      {section === 'records' && progress.kind === 'reps' && (
        <RecordsTable kind="reps" records={maxRepsRecords} />
      )}
      {section === 'history' && <SessionList sessions={sessions} points={progress.points} />}
    </div>
  )
}

import { useExerciseStore } from '@/entities/exercise'
import { pluralize } from '@/shared/lib'
import { ConfirmAction } from '@/shared/ui'

type DeleteExerciseButtonProps = {
  exerciseId: string
  /** Active workouts with this exercise: they keep showing it, so the user is warned. */
  workoutCount: number
  onDeleted: () => void
}

const getQuestion = (workoutCount: number): string =>
  workoutCount === 0
    ? 'Удалить упражнение?'
    : `Упражнение есть в ${workoutCount} ${pluralize(workoutCount, ['тренировке', 'тренировках', 'тренировках'])}. ` +
      'Из истории оно не пропадёт, только из подсказок. Удалить?'

export const DeleteExerciseButton = ({
  exerciseId,
  workoutCount,
  onDeleted,
}: DeleteExerciseButtonProps) => {
  const deleteExercises = useExerciseStore((state) => state.deleteExercises)

  return (
    <ConfirmAction
      label="Удалить упражнение"
      question={getQuestion(workoutCount)}
      confirmLabel="Удалить"
      onConfirm={() => {
        onDeleted()
        deleteExercises([exerciseId])
      }}
    />
  )
}

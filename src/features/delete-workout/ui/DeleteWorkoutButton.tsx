import { useWorkoutStore } from '@/entities/workout'
import { ConfirmAction } from '@/shared/ui'

type DeleteWorkoutButtonProps = {
  workoutId: string
  onDeleted: () => void
}

export const DeleteWorkoutButton = ({ workoutId, onDeleted }: DeleteWorkoutButtonProps) => {
  const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout)

  return (
    <ConfirmAction
      label="Удалить тренировку"
      question="Удалить тренировку? Это действие нельзя отменить."
      confirmLabel="Удалить"
      onConfirm={() => {
        // Navigate first so the page does not flash "not found" for the deleted workout.
        onDeleted()
        deleteWorkout(workoutId)
      }}
    />
  )
}

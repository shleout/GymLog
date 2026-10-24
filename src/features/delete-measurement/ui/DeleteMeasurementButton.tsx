import { useMeasurementStore } from '@/entities/measurement'
import { ConfirmAction } from '@/shared/ui'

type DeleteMeasurementButtonProps = {
  measurementId: string
  onDeleted: () => void
}

export const DeleteMeasurementButton = ({ measurementId, onDeleted }: DeleteMeasurementButtonProps) => {
  const deleteMeasurement = useMeasurementStore((state) => state.deleteMeasurement)

  return (
    <ConfirmAction
      label="Удалить замеры"
      question="Удалить эту сессию замеров? Это действие нельзя отменить."
      confirmLabel="Удалить"
      onConfirm={() => {
        // Navigate first so the page does not flash "not found" for the deleted session.
        onDeleted()
        deleteMeasurement(measurementId)
      }}
    />
  )
}

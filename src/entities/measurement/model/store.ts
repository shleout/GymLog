import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createZodStorage } from '@/shared/lib'
import { MeasurementStateSchema } from './schemas'
import type { Measurement, MeasurementState } from './types'

type MeasurementActions = {
  addMeasurement: (measurement: Measurement) => void
  deleteMeasurement: (id: string) => void
}

export type MeasurementStore = MeasurementState & MeasurementActions

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set): MeasurementStore => ({
      measurements: [],
      addMeasurement: (measurement) =>
        set((state) => ({ measurements: [...state.measurements, measurement] })),
      deleteMeasurement: (id) =>
        set((state) => ({
          measurements: state.measurements.filter((measurement) => measurement.id !== id),
        })),
    }),
    {
      name: 'gymlog-measurements',
      storage: createZodStorage(MeasurementStateSchema),
      partialize: (state): MeasurementState => ({ measurements: state.measurements }),
    },
  ),
)

export const useMeasurementById = (id: string | undefined): Measurement | undefined =>
  useMeasurementStore((state) => state.measurements.find((measurement) => measurement.id === id))

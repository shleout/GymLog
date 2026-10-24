import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import {
  createPersistStorage,
  createSyncMeta,
  nowIso,
  pickPersistedField,
  restoreItems,
} from '@/shared/lib'
import { MEASUREMENT_STATE_VERSION, migrateMeasurementState } from './migrations'
import { MeasurementSchema } from './schemas'
import type { Measurement, MeasurementInput, MeasurementState } from './types'

const STORAGE_KEY = 'gymlog-measurements'

type MeasurementActions = {
  addMeasurement: (measurement: MeasurementInput) => void
  /** Soft delete: the record stays as a tombstone for sync. */
  deleteMeasurement: (id: string) => void
}

export type MeasurementStore = MeasurementState & MeasurementActions

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set): MeasurementStore => ({
      measurements: [],
      addMeasurement: (measurement) =>
        set((state) => ({
          measurements: [...state.measurements, { ...measurement, ...createSyncMeta() }],
        })),
      deleteMeasurement: (id) =>
        set((state) => {
          const now = nowIso()
          return {
            measurements: state.measurements.map((measurement) =>
              measurement.id === id ? { ...measurement, deletedAt: now, updatedAt: now } : measurement,
            ),
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: MEASUREMENT_STATE_VERSION,
      storage: createPersistStorage(),
      migrate: migrateMeasurementState,
      // Validation happens here, after migrate: each record separately.
      merge: (persisted, current) => ({
        ...current,
        measurements:
          restoreItems(
            STORAGE_KEY,
            pickPersistedField(persisted, 'measurements'),
            MeasurementSchema,
          ) ?? current.measurements,
      }),
      partialize: (state): MeasurementState => ({ measurements: state.measurements }),
    },
  ),
)

export const selectActiveMeasurements = (state: MeasurementState): Measurement[] =>
  state.measurements.filter((measurement) => measurement.deletedAt === null)

/** Sessions that are not deleted. `useShallow` keeps the filtered array referentially stable. */
export const useMeasurements = (): Measurement[] =>
  useMeasurementStore(useShallow(selectActiveMeasurements))

export const useMeasurementById = (id: string | undefined): Measurement | undefined =>
  useMeasurementStore((state) =>
    state.measurements.find(
      (measurement) => measurement.id === id && measurement.deletedAt === null,
    ),
  )

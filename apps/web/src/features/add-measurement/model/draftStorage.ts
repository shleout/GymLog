import { useState } from 'react'
import { z } from 'zod'
import { hasDraft } from '@/shared/lib'
import type { MeasurementDraft } from './types'

/** Shape of the stored draft; typed against `MeasurementDraft` so the two can't drift apart. */
export const MeasurementDraftSchema: z.ZodType<MeasurementDraft> = z.object({
  date: z.string(),
  weight: z.string(),
  parts: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      value: z.string(),
      known: z.boolean(),
      previous: z.object({ value: z.number(), date: z.string() }).optional(),
    }),
  ),
})

export const MEASUREMENT_DRAFT_KEY = 'measurement:new'

/** Unfinished measurements are waiting; read once per mount (the page remounts on return). */
export const useHasMeasurementDraft = (): boolean => useState(() => hasDraft(MEASUREMENT_DRAFT_KEY))[0]

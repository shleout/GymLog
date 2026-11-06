import { z } from 'zod'
import { RecordDateSchema, SyncMetaSchema } from './syncMeta.js'

export const NOTE_MAX_LENGTH = 1000

/** Free-text note; absent rather than empty. */
const NoteSchema = z
  .string()
  .trim()
  .min(1)
  .max(NOTE_MAX_LENGTH, `Не длиннее ${NOTE_MAX_LENGTH} символов`)

export const RIR_MAX = 10

/** Upper bound of one timed set: 3 hours. */
export const DURATION_MAX_SEC = 3 * 60 * 60

export const RepsSchema = z
  .number({
    error: (issue) => (issue.input === undefined ? 'Укажите повторения' : 'Введите число'),
  })
  .int('Целое число')
  .positive('Больше 0')

export const DurationSecSchema = z
  .number({ error: 'Введите время' })
  .int('Целое число')
  .positive('Больше 0')
  .max(DURATION_MAX_SEC, 'Слишком долго')

export const SetSchema = z
  .object({
    id: z.string().min(1),
    /** Working or additional weight in kg; omitted for bodyweight sets. */
    weight: z
      .number({ error: 'Введите число' })
      .positive('Вес должен быть больше 0')
      .refine((value) => Number.isInteger(value * 2), { message: 'Шаг веса — 0,5 кг' })
      .optional(),
    /** Reps of a regular set; omitted for a timed set (`durationSec` instead). */
    reps: RepsSchema.optional(),
    /** Time under load of a timed set (a hold), seconds; omitted for a regular set. */
    durationSec: DurationSecSchema.optional(),
    completed: z.boolean(),
    /** Reps in reserve: how many more reps were left in the tank; omitted when not rated. */
    rir: z
      .number({ error: 'Введите число' })
      .int('Целое число')
      .min(0, 'От 0')
      .max(RIR_MAX, `До ${RIR_MAX}`)
      .optional(),
  })
  .refine((set) => (set.reps === undefined) !== (set.durationSec === undefined), {
    message: 'Укажите повторения или время',
  })

export const WorkoutEntrySchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(SetSchema),
  /** Note about the exercise in this workout, e.g. machine settings or "next time 82.5". */
  note: NoteSchema.optional(),
})

export const WorkoutSchema = z
  .object({
    id: z.string().min(1),
    date: RecordDateSchema,
    entries: z.array(WorkoutEntrySchema),
    /** Note about the whole workout, e.g. sleep or how it felt. */
    note: NoteSchema.optional(),
  })
  .extend(SyncMetaSchema.shape)

export type Set = z.infer<typeof SetSchema>
export type WorkoutEntry = z.infer<typeof WorkoutEntrySchema>
export type Workout = z.infer<typeof WorkoutSchema>

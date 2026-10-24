import { normalizeName } from '@/shared/lib'

/** Key for matching exercise names: "  Жим  Лёжа " and "жим лежа" are the same exercise. */
export const normalizeExerciseName = normalizeName

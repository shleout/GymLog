/** Above this many reps the Epley estimate overshoots noticeably; the UI marks such values with ≈. */
export const RELIABLE_ESTIMATE_MAX_REPS = 12

/**
 * Estimated one-rep max by the Epley formula: weight × (1 + reps / 30).
 * A single is the max itself (the formula would add 3%).
 */
export const estimateOneRepMax = (weight: number, reps: number): number =>
  reps === 1 ? weight : weight * (1 + reps / 30)

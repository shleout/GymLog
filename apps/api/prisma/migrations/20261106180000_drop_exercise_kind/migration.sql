-- The reps/time choice moved from the exercise to the workout entry (it is derived from sets).
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "kind";

-- DropEnum
DROP TYPE "ExerciseKind";

-- CreateEnum
CREATE TYPE "ExerciseKind" AS ENUM ('reps', 'time');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "kind" "ExerciseKind" NOT NULL DEFAULT 'reps';

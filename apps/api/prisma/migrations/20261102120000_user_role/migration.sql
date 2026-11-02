-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';

-- The project owner. Emails are stored lowercased (EmailSchema), so an exact match is enough.
-- If the account doesn't exist yet in this database, nothing changes: grant the role later with
-- the same UPDATE.
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'optime15022013@mail.ru';

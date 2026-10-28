-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "previousId" UUID;

-- CreateIndex
CREATE INDEX "RefreshToken_previousId_idx" ON "RefreshToken"("previousId");

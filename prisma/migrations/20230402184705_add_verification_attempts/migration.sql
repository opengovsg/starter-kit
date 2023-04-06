-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "attempts" INT4 NOT NULL DEFAULT 0;

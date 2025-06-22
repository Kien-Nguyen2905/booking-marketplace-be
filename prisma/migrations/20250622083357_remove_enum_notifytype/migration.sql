/*
  Warnings:

  - The values [DEMAND] on the enum `NotifyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotifyType_new" AS ENUM ('REFUND', 'INFORM');
ALTER TABLE "Notify" ALTER COLUMN "type" TYPE "NotifyType_new" USING ("type"::text::"NotifyType_new");
ALTER TYPE "NotifyType" RENAME TO "NotifyType_old";
ALTER TYPE "NotifyType_new" RENAME TO "NotifyType";
DROP TYPE "NotifyType_old";
COMMIT;

/*
  Warnings:

  - You are about to drop the column `type` on the `Notify` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notify" DROP COLUMN "type";

-- DropEnum
DROP TYPE "NotifyType";

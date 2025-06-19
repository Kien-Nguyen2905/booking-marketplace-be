/*
  Warnings:

  - You are about to alter the column `reason` on the `Refund` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "reason" SET DATA TYPE VARCHAR(255);

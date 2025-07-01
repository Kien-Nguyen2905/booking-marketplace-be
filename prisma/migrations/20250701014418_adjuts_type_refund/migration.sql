/*
  Warnings:

  - You are about to alter the column `amount` on the `Refund` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

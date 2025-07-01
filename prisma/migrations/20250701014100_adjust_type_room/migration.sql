/*
  Warnings:

  - You are about to alter the column `price` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "price" SET DATA TYPE INTEGER;

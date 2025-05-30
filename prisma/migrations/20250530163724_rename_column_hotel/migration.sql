/*
  Warnings:

  - You are about to drop the column `reputationCore` on the `Hotel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "reputationCore",
ADD COLUMN     "reputationScore" REAL DEFAULT 100;

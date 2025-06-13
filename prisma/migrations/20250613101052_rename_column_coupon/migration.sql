/*
  Warnings:

  - You are about to drop the column `usedCount` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "usedCount",
ADD COLUMN     "available" INTEGER DEFAULT 0;

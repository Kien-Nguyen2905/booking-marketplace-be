/*
  Warnings:

  - You are about to drop the column `status` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "status";

-- DropEnum
DROP TYPE "CouponStatus";

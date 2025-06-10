/*
  Warnings:

  - You are about to drop the column `updatedById` on the `Coupon` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_updatedById_fkey";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "updatedById";

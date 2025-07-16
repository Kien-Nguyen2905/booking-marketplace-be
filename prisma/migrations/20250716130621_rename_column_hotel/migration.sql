/*
  Warnings:

  - You are about to drop the column `lng` on the `Hotel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "lng",
ADD COLUMN     "lon" DOUBLE PRECISION;

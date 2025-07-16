/*
  Warnings:

  - You are about to alter the column `lat` on the `Hotel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(23,20)`.
  - You are about to alter the column `lon` on the `Hotel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(23,20)`.

*/
-- AlterTable
ALTER TABLE "Hotel" ALTER COLUMN "lat" SET DATA TYPE DECIMAL(23,20),
ALTER COLUMN "lon" SET DATA TYPE DECIMAL(23,20);

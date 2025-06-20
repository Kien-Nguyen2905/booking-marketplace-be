/*
  Warnings:

  - You are about to alter the column `accountNumber` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Partner" ALTER COLUMN "birth" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "accountNumber" SET DATA TYPE VARCHAR(100);

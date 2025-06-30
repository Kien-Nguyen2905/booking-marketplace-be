/*
  Warnings:

  - You are about to drop the column `commissionAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `basePrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.
  - You are about to alter the column `pointDiscount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.
  - You are about to alter the column `vatAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.
  - You are about to alter the column `totalPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.
  - You are about to alter the column `serviceFeeAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.
  - You are about to alter the column `couponAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.
  - You are about to alter the column `promotionAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "commissionAmount",
ADD COLUMN     "partnerProfit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "platformProfit" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "basePrice" SET DATA TYPE INTEGER,
ALTER COLUMN "pointDiscount" SET DEFAULT 0,
ALTER COLUMN "pointDiscount" SET DATA TYPE INTEGER,
ALTER COLUMN "vatAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "serviceFeeAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "couponAmount" SET DEFAULT 0,
ALTER COLUMN "couponAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "promotionAmount" SET DEFAULT 0,
ALTER COLUMN "promotionAmount" SET DATA TYPE INTEGER;

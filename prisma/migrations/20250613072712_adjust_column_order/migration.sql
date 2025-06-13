/*
  Warnings:

  - You are about to drop the column `discountId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_discountId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "discountId",
DROP COLUMN "notes",
ADD COLUMN     "couponAmount" REAL NOT NULL DEFAULT 0,
ADD COLUMN     "promotionAmount" REAL NOT NULL DEFAULT 0,
ADD COLUMN     "promotionId" INTEGER,
ALTER COLUMN "pointDiscount" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

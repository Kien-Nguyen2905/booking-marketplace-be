/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Refund` will be added. If there are existing duplicate values, this will fail.

*/

-- SetForeignKey not null
ALTER TABLE "Refund" ALTER COLUMN "orderId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_orderId_key" ON "Refund"("orderId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

/*
  Warnings:

  - A unique constraint covering the columns `[userId,userAgent]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_userAgent_key" ON "Device"("userId", "userAgent");

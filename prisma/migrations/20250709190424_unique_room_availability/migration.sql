/*
  Warnings:

  - A unique constraint covering the columns `[roomId,createdAt]` on the table `RoomAvailability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RoomAvailability_roomId_createdAt_key" ON "RoomAvailability"("roomId", "createdAt");

/*
  Warnings:

  - A unique constraint covering the columns `[roomTypeId,amenityId]` on the table `RoomTypeAmenity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "HotelAmenity_hotelId_amenityId_idx" ON "HotelAmenity"("hotelId", "amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomTypeAmenity_roomTypeId_amenityId_key" ON "RoomTypeAmenity"("roomTypeId", "amenityId");

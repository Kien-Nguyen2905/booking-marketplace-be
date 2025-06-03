CREATE UNIQUE INDEX "RoomType_type_hotelId_unique"
ON "RoomType" ("hotelId","type")
WHERE "deletedAt" IS NULL;
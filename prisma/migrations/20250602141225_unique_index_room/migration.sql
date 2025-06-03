CREATE UNIQUE INDEX "Room_policy_roomTypeId_hotelId_unique"
ON "Room" ("policy","roomTypeId","hotelId")
WHERE "deletedAt" IS NULL;
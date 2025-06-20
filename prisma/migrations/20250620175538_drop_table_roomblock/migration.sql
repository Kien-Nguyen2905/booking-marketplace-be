/*
  Warnings:

  - You are about to drop the `RoomBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoomBlock" DROP CONSTRAINT "RoomBlock_roomId_fkey";

-- DropTable
DROP TABLE "RoomBlock";

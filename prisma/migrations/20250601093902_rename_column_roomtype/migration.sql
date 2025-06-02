/*
  Warnings:

  - You are about to drop the column `roomType` on the `RoomType` table. All the data in the column will be lost.
  - Added the required column `type` to the `RoomType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "roomType",
ADD COLUMN     "type" VARCHAR(100) NOT NULL;

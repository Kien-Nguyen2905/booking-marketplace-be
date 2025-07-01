/*
  Warnings:

  - You are about to drop the column `birth` on the `Partner` table. All the data in the column will be lost.
  - Added the required column `birthday` to the `Partner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Partner" DROP COLUMN "birth",
ADD COLUMN     "birthday" DATE NOT NULL;

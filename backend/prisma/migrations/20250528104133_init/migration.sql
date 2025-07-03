/*
  Warnings:

  - You are about to drop the column `parkingLotId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `ParkingLot` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ParkingId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_parkingLotId_fkey";

-- DropIndex
DROP INDEX "Reservation_parkingLotId_idx";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "parkingLotId",
ADD COLUMN     "ParkingId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ParkingLot";

-- CreateTable
CREATE TABLE "Parking" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "Parking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_ParkingId_idx" ON "Reservation"("ParkingId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_ParkingId_fkey" FOREIGN KEY ("ParkingId") REFERENCES "Parking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

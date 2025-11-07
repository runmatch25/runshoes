-- CreateEnum
CREATE TYPE "Fit" AS ENUM ('SMALL', 'TRUE_TO_SIZE', 'BIG');

-- CreateEnum
CREATE TYPE "Cushion" AS ENUM ('SOFT', 'BALANCED', 'FIRM');

-- CreateEnum
CREATE TYPE "Stability" AS ENUM ('NEUTRAL', 'MODERATE_SUPPORT', 'HIGH_SUPPORT');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "cushion" "Cushion",
ADD COLUMN     "fit" "Fit",
ADD COLUMN     "mileage" INTEGER,
ADD COLUMN     "paceMinutes" INTEGER,
ADD COLUMN     "paceSeconds" INTEGER,
ADD COLUMN     "stability" "Stability";

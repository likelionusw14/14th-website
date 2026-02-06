/*
  Warnings:

  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "confirmedInterviewDate" TIMESTAMP(3),
ADD COLUMN     "confirmedInterviewTime" TEXT,
ADD COLUMN     "interviewPreferences" TEXT,
ADD COLUMN     "phoneLastDigits" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ApplicationSettings" (
    "id" SERIAL NOT NULL,
    "resultOpenDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationSettings_pkey" PRIMARY KEY ("id")
);

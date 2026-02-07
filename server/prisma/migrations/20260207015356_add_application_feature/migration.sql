-- AlterTable
ALTER TABLE "ApplicationSettings" ADD COLUMN     "documentResultEndDate" TIMESTAMP(3),
ADD COLUMN     "documentResultStartDate" TIMESTAMP(3),
ADD COLUMN     "finalResultDate" TIMESTAMP(3),
ADD COLUMN     "interviewScheduleDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "InterviewSettings" (
    "id" SERIAL NOT NULL,
    "availableDates" TEXT NOT NULL DEFAULT '[]',
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '16:00',
    "intervalMinutes" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSettings_pkey" PRIMARY KEY ("id")
);

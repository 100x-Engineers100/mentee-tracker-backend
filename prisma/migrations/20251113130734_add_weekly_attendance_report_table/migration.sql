-- CreateTable
CREATE TABLE "weekly_attendance_reports" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "cohortBatch" TEXT NOT NULL,
    "totalMentees" INTEGER NOT NULL,
    "totalPresent" INTEGER NOT NULL,
    "totalAbsent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_attendance_reports_pkey" PRIMARY KEY ("id")
);

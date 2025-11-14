/*
  Warnings:

  - A unique constraint covering the columns `[weekNumber,cohortBatch]` on the table `weekly_attendance_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "weekly_attendance_reports_weekNumber_cohortBatch_key" ON "weekly_attendance_reports"("weekNumber", "cohortBatch");

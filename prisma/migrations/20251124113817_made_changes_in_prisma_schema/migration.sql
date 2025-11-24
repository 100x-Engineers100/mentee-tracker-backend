/*
  Warnings:

  - A unique constraint covering the columns `[mentee_id,session_date,session_type]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendances_mentee_id_session_date_session_type_key" ON "attendances"("mentee_id", "session_date", "session_type");

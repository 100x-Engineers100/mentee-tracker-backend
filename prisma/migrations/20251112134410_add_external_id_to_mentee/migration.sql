/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `mentees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "mentees" ADD COLUMN     "external_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "mentees_external_id_key" ON "mentees"("external_id");

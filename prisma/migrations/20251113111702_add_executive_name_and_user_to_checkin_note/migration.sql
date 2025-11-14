/*
  Warnings:

  - Added the required column `executive_name` to the `check_in_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "check_in_notes" ADD COLUMN     "executive_name" TEXT NOT NULL;

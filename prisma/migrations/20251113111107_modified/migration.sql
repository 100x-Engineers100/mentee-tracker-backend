/*
  Warnings:

  - You are about to drop the column `user_id` on the `check_in_notes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "check_in_notes" DROP CONSTRAINT "check_in_notes_user_id_fkey";

-- AlterTable
ALTER TABLE "check_in_notes" DROP COLUMN "user_id";

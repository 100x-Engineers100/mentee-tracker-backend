-- AlterTable
ALTER TABLE "mentees" ADD COLUMN     "attendance_percentage" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "pocs" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT,
    "poc" TEXT,

    CONSTRAINT "pocs_pkey" PRIMARY KEY ("id")
);

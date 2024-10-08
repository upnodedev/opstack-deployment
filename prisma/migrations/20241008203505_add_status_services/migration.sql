-- CreateEnum
CREATE TYPE "EnumStatus" AS ENUM ('BUILDING', 'UP', 'DOWN', 'FAILED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "status" "EnumStatus" NOT NULL DEFAULT 'UNKNOWN';

/*
  Warnings:

  - The `value` column on the `configs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "configs" DROP COLUMN "value",
ADD COLUMN     "value" JSONB NOT NULL DEFAULT '{"value": ""}';

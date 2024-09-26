/*
  Warnings:

  - The primary key for the `configs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `configs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `services` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `serviceId` on the `configs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "configs" DROP CONSTRAINT "configs_serviceId_fkey";

-- AlterTable
ALTER TABLE "configs" DROP CONSTRAINT "configs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "serviceId",
ADD COLUMN     "serviceId" INTEGER NOT NULL,
ADD CONSTRAINT "configs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "services" DROP CONSTRAINT "services_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "configs" ADD CONSTRAINT "configs_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

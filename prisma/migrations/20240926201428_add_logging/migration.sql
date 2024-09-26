-- CreateTable
CREATE TABLE "loggings" (
    "id" SERIAL NOT NULL,
    "service" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loggings_pkey" PRIMARY KEY ("id")
);

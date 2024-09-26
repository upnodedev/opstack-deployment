// src/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'], // Optional: Enable Prisma logs for better visibility
  log: ['warn', 'error'], // Optional: Enable Prisma logs for better visibility
});

export async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1); // Optional: Exit if unable to connect on startup
  }
}

export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log('Prisma disconnected successfully');
  } catch (error) {
    console.error('Failed to disconnect Prisma', error);
  }
}

export default prisma;

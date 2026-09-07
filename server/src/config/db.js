import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(' Successfully connected to PostgreSQL Database via Prisma.');
  } catch (error) {
    console.warn(' PostgreSQL connection warning:', error.message);
    console.warn(' Server is running. Ensure PostgreSQL is started and DATABASE_URL is configured in .env');
  }
};

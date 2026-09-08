import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client instance
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

export { prisma };

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL Database via Prisma.');
  } catch (error) {
    console.warn('⚠️ PostgreSQL connection warning:', error.message);
    console.warn('📝 Server is running. Ensure PostgreSQL is started and DATABASE_URL is configured in .env');
  }
};
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const createPrismaClient = () => {
  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL ?? 'file:./prisma/dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

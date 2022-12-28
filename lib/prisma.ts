import { PrismaClient } from '@prisma/client';

declare module global {
  let prisma: PrismaClient | undefined;
}
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  global.prisma ??= new PrismaClient();
  prisma = global.prisma;
}

export { prisma };

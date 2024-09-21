import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

let prisma: PrismaClient | null = null;

export const getPrisma = (DATABASE_URL: string) => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return prisma;
};

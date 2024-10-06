import { PrismaClient } from "@prisma/client";
import { setupMongoServer } from "./mongo";

await setupMongoServer();

export const prismaTestingClient = new PrismaClient({
  datasources: {
    db: {
      url: "mongodb://localhost:27017/critorquit?replicaSet=rs0&directConnection=true&authSource=admin",
    },
  },
});

export const resetDatabase = () => prismaTestingClient.profile.deleteMany();

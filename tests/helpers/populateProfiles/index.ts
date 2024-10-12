import { PrismaClient, Profile } from "@prisma/client";

type Config = {
  prisma: PrismaClient;
};

export const populateProfiles = async (
  profiles: Profile[],
  { prisma }: Config
) => prisma.profile.createMany({ data: profiles });

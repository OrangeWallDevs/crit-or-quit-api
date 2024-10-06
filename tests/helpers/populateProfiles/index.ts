import { Profile, PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";

type Config = {
  redis: Redis;
  prisma: PrismaClient;
};

export const populateProfiles = async (
  profiles: Profile[],
  { redis, prisma }: Config
) => {
  const prismaOperation = prisma.profile.createMany({ data: profiles });
  const redisOperation = redis.set(
    "collection",
    profiles.map((profile) => profile.id)
  );

  return Promise.all([prismaOperation, redisOperation]);
};

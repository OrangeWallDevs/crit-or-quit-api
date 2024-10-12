import { PrismaClient } from "@prisma/client/edge";
import { Redis } from "@upstash/redis";
import { getSessionData } from "../../lib/session/getSessionData";
import { setSessionData } from "../../lib/session/setSessionData";

export const createProfileService = (
  redis: Redis,
  prisma: PrismaClient,
  sessionTTL: number
) => {
  const getNextRandomProfiles = async (
    sessionID: string,
    pageSize: number = 10
  ) => {
    const { shuffledCollection, currentIndex } = await getSessionData(
      redis,
      sessionID
    );

    const itemsToRetrieve = shuffledCollection.slice(
      currentIndex,
      currentIndex + pageSize
    );

    const prismaQuery = prisma.profile.findMany({
      where: {
        id: { in: itemsToRetrieve },
      },
    });

    const redisTransaction = setSessionData(redis, sessionID, {
      shuffledCollection,
      currentIndex: currentIndex + pageSize,
      ttl: sessionTTL,
    });

    const [queryResult] = await Promise.allSettled([
      prismaQuery,
      redisTransaction,
    ]);

    if (queryResult.status === "rejected") {
      throw queryResult.reason;
    }

    return queryResult.value;
  };

  return {
    getNextRandomProfiles,
  };
};

import { PrismaClient } from "@prisma/client/edge";
import { Redis } from "@upstash/redis";
import { shuffle } from "../../lib/shuffle";

export const createProfileService = (
  redis: Redis,
  prisma: PrismaClient,
  sessionTTL: number
) => {
  const getNextRandomProfiles = async (
    sessionID: string,
    pageSize: number = 10
  ) => {
    let [collection, shuffledList, currentIndex] = await redis.mget<
      [string[], string[] | null, string | null]
    >(["collection", `collection:${sessionID}`, `index:${sessionID}`]);

    if (!shuffledList) {
      shuffledList = shuffle(collection);
    }

    if (!currentIndex) {
      currentIndex = "0";
    }

    const parsedIndex = parseInt(currentIndex, 10);
    const itemsToRetrieve = shuffledList.slice(
      parsedIndex,
      parsedIndex + pageSize
    );

    const prismaQuery = prisma.profile.findMany({
      where: {
        id: { in: itemsToRetrieve },
      },
    });

    const redisTransaction = redis
      .multi()
      .mset({
        [`collection:${sessionID}`]: shuffledList,
        [`index:${sessionID}`]: (parsedIndex + pageSize).toString(),
      })
      .expire(sessionID, sessionTTL)
      .expire(`collection:${sessionID}`, sessionTTL)
      .expire(`index:${sessionID}`, sessionTTL)
      .exec();

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

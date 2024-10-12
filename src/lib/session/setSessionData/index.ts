import { Redis } from "@upstash/redis";
import { SessionData } from "../types";

export const setSessionData = async (
  redis: Redis,
  sessionID: string,
  data: SessionData & { ttl: number }
) => {
  const indexKey = `index:${sessionID}`;
  const collectionKey = `collection:${sessionID}`;

  const transaction = redis
    .multi()
    .mset({
      [indexKey]: data.currentIndex.toString(),
      [collectionKey]: data.shuffledCollection,
    })
    .expire(indexKey, data.ttl)
    .expire(collectionKey, data.ttl)
    .exec();

  return transaction;
};

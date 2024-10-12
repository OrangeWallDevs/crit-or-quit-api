import { Redis } from "@upstash/redis";
import { SessionData } from "../types";
import { shuffle } from "../../shuffle";

export const getSessionData = async (
  redis: Redis,
  sessionID: string
): Promise<SessionData> => {
  let [collection, shuffledCollection, currentIndex] = await redis.mget<
    [string[], string[] | null, string | null]
  >(["collection", `collection:${sessionID}`, `index:${sessionID}`]);

  return {
    currentIndex: currentIndex ? parseInt(currentIndex, 10) : 0,
    shuffledCollection: shuffledCollection ?? shuffle(collection),
  };
};

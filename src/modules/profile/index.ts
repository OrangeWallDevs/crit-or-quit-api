import { Hono } from "hono";
import { env } from "hono/adapter";
import { getRedis } from "../../lib/getRedis";
import { getPrisma } from "../../lib/getPrisma";
import { getSessionID } from "../../lib/getSessionID";
import { createProfileService } from "../../services/profile";

type Environment = {
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
  DATABASE_URL: string;
  SESSION_TTL: number;
};

export const profileApp = new Hono();

profileApp.get("/", async (context) => {
  const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN, SESSION_TTL, DATABASE_URL } =
    env<Environment>(context);

  const redis = await getRedis(UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN);
  const prisma = getPrisma(DATABASE_URL);
  const sessionID = getSessionID(context);

  const specifiedPageSize = context.req.query("pageSize");
  const pageSize = specifiedPageSize ? parseInt(specifiedPageSize, 10) : 10;

  const profielService = createProfileService(redis, prisma, SESSION_TTL);
  const randomProfiles = await profielService.getNextRandomProfiles(
    sessionID,
    pageSize
  );

  return context.json({ profiles: randomProfiles });
});

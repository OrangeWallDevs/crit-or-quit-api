import { Hono } from "hono";
import { env } from "hono/adapter";
import { getRedis } from "./lib/getRedis";
import { getSessionID } from "./lib/getSessionID";
import { sessionIdMiddleware } from "./middleware/sessionId/sessionId.middleware";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

type Environment = {
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
  DATABASE_URL: string;
  SESSION_TTL: number;
};

const app = new Hono();

app.use(sessionIdMiddleware);

app.get("/", async (c) => {
  const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN, SESSION_TTL, DATABASE_URL } =
    env<Environment>(c);

  const redis = await getRedis(UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  const sessionID = getSessionID(c);
  const message = await redis.get<string | null>(sessionID);

  if (!message) {
    await redis.set(sessionID, "Hello, World!", { ex: SESSION_TTL });
  }

  redis.expire(sessionID, SESSION_TTL);

  const response = await prisma.profile.findMany();

  await redis.set("collection", JSON.stringify(response.map((r) => r.id)));
  return c.json({ profile: response[37] });
});

export default app;

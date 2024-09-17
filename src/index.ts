import { Hono } from "hono";
import { env } from "hono/adapter";
import { getRedis } from "./lib/getRedis";
import { getSessionID } from "./lib/getSessionID";
import { sessionIdMiddleware } from "./middleware/sessionId/sessionId.middleware";

type Environment = {
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
};

const app = new Hono();

app.use(sessionIdMiddleware);

app.get("/", async (c) => {
  const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } = env<Environment>(c);
  const redis = await getRedis(UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN);

  const sessionID = getSessionID(c);

  await redis.set(sessionID, "Hello, World!");
  return c.json({ id: sessionID });
});

export default app;

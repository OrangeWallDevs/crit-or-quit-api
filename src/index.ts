import { Hono } from "hono";
import { env } from "hono/adapter";
import { getRedis } from "./lib/getRedis";
import { getSessionID } from "./lib/getSessionID";
import { sessionIdMiddleware } from "./middleware/sessionId/sessionId.middleware";

type Environment = {
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
  SESSION_TTL: number;
};

const app = new Hono();

app.use(sessionIdMiddleware);

app.get("/", async (c) => {
  const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN, SESSION_TTL } =
    env<Environment>(c);

  const redis = await getRedis(UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN);

  const sessionID = getSessionID(c);
  const message = await redis.get<string | null>(sessionID);

  if (!message) {
    await redis.set(sessionID, "Hello, World!", { ex: SESSION_TTL });
  }

  redis.expire(sessionID, SESSION_TTL);

  return c.json({ id: sessionID });
});

export default app;

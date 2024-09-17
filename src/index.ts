import { Hono } from "hono";
import { getSessionID } from "./lib/getSessionID";
import { sessionIdMiddleware } from "./middleware/sessionId/sessionId.middleware";

const app = new Hono();

app.use(sessionIdMiddleware);

app.get("/", (c) => {
  const sessionID = getSessionID(c);

  return c.json({ id: sessionID });
});

export default app;

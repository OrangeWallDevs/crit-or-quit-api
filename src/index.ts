import { Hono } from "hono";
import { sessionIdMiddleware } from "./middleware/sessionId/sessionId.middleware";
import { profileApp } from "./modules/profile";

export const createApp = async () => {
  const app = new Hono();

  app.use(sessionIdMiddleware);
  app.route("/profiles", profileApp);

  return app;
};

const app = await createApp();
export default app;

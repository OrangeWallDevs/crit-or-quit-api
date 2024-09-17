import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { createSessionID } from "../../lib/createSessionID";

declare module "hono" {
  interface ContextVariableMap {
    sessionID: string | undefined;
  }
}

export const sessionIdMiddleware = createMiddleware(async (c, next) => {
  const sessionID = getCookie(c, "session_id");

  if (!sessionID) {
    const newSessionID = createSessionID();

    setCookie(c, "session_id", newSessionID);
    c.set("sessionID", newSessionID);
  }

  await next();
});

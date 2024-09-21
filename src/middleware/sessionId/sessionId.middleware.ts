import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { createSessionID } from "../../lib/createSessionID";

declare module "hono" {
  interface ContextVariableMap {
    sessionID: string | undefined;
  }
}

export const sessionIdMiddleware = createMiddleware(async (context, next) => {
  const sessionID = getCookie(context, "session_id");

  if (!sessionID) {
    const newSessionID = createSessionID();

    setCookie(context, "session_id", newSessionID);
    context.set("sessionID", newSessionID);
  }

  await next();
});

import { Context } from "hono";
import { getCookie } from "hono/cookie";

export const getSessionID = (context: Context) =>
  context.get("sessionID") ?? getCookie(context, "session_id")!;

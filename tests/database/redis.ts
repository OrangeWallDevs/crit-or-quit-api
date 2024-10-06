import { Redis } from "@upstash/redis";

export const redisTestingClient = new Redis({
  url: "http://localhost:8079",
  token: "example_token",
});

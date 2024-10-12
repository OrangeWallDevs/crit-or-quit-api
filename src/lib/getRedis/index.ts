import { Redis } from "@upstash/redis/cloudflare";

let client: Redis | null = null;

export const getRedis = async (url: string, token: string) => {
  if (client) {
    return client;
  }

  client = new Redis({
    url,
    token,
  });

  return client;
};

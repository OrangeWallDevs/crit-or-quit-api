import * as matchers from "jest-extended";
import { afterEach, beforeAll, expect, vi } from "vitest";
import { prismaTestingClient, resetDatabase } from "./database/prisma";
import * as prismaHelpers from "../src/lib/getPrisma";
import * as redisHelpers from "../src/lib/getRedis";
import { Redis } from "@upstash/redis";
import { redisTestingClient } from "./database/redis";

expect.extend(matchers);

beforeAll(() => {
  vi.spyOn(prismaHelpers, "getPrisma").mockReturnValue(prismaTestingClient);
  vi.spyOn(redisHelpers, "getRedis").mockResolvedValue(redisTestingClient);
});

afterEach(async () => {
  await resetDatabase();
});

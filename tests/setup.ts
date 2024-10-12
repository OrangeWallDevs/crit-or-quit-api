import * as matchers from "jest-extended";
import { afterEach, beforeAll, expect, vi } from "vitest";
import * as prismaHelpers from "../src/lib/getPrisma";
import * as redisHelpers from "../src/lib/getRedis";
import * as setSessionDataUtils from "../src/lib/session/setSessionData";
import * as shuffleUtils from "../src/lib/shuffle";
import { prismaTestingClient, resetDatabase } from "./database/prisma";
import { redisTestingClient } from "./database/redis";

expect.extend(matchers);

beforeAll(() => {
  vi.spyOn(prismaHelpers, "getPrisma").mockReturnValue(prismaTestingClient);
  vi.spyOn(redisHelpers, "getRedis").mockResolvedValue(redisTestingClient);

  /* @TODO: Remove this mock when serveles-redis-http stops crashing with the EXPIRE command (https://github.com/hiett/serverless-redis-http/issues/36) */
  vi.spyOn(setSessionDataUtils, "setSessionData").mockResolvedValue([
    "OK",
    1,
    1,
  ]);

  vi.spyOn(shuffleUtils, "shuffle").mockImplementation(
    (collection) => collection
  );
});

afterEach(async () => {
  await resetDatabase();
});

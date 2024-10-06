import { Profile } from "@prisma/client";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../..";
import { prismaTestingClient } from "../../../tests/database/prisma";
import { redisTestingClient } from "../../../tests/database/redis";
import { createFakeProfiles } from "../../../tests/fixtures/profile/createProfiles";
import { populateProfiles } from "../../../tests/helpers/populateProfiles";
import * as shuffleUtils from "../../lib/shuffle";

const FAKE_PROFILES = createFakeProfiles(100);

describe.skip("Module: Profile", () => {
  beforeEach(async () => {
    await populateProfiles(FAKE_PROFILES, {
      prisma: prismaTestingClient,
      redis: redisTestingClient,
    });
  });

  beforeAll(async () => {
    vi.spyOn(shuffleUtils, "shuffle").mockImplementation(
      (collection) => collection
    );
  });

  describe("GET /profiles", () => {
    it("should return list of random profiles", async () => {
      const app = await createApp();
      const response = await app.request("/profiles", {});

      expect(response.status).toBe(200);

      const { profiles } = await response.json<{ profiles: Profile[] }>();

      expect(profiles).toHaveLength(10);
      expect(profiles).toIncludeSameMembers(FAKE_PROFILES.slice(0, 10));
    });

    it("should return list of random profiles with given length", async () => {
      const app = await createApp();
      const response = await app.request("/profiles?pageSize=5", {});

      expect(response.status).toBe(200);

      const { profiles } = await response.json<{ profiles: Profile[] }>();

      expect(profiles).toHaveLength(5);
      expect(profiles).toIncludeSameMembers(FAKE_PROFILES.slice(0, 5));
    });

    it.only("should return subsequent profiles after first request", async () => {
      const app = await createApp();

      await app.request("/profiles", {});

      const nextResponse = await app.request("/profiles", {});
      expect(nextResponse.status).toBe(200);

      const { profiles } = await nextResponse.json<{ profiles: Profile[] }>();

      expect(profiles).toHaveLength(10);
      expect(profiles).toIncludeSameMembers(FAKE_PROFILES.slice(10, 20));
    });

    it.todo(
      "should return remaining profiles if requested length is greater than total profiles"
    );

    it.todo("should return empty list if no profiles are available");
  });

  describe("POST /profiles/reset", () => {
    it.todo("should return new profiles after list is reset");
    it.todo("should reshuffle profiles after list is reset if requested");
  });
});

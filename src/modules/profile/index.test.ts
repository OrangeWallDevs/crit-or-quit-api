import { Profile } from "@prisma/client";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../..";
import { prismaTestingClient } from "../../../tests/database/prisma";
import { redisTestingClient } from "../../../tests/database/redis";
import { createFakeProfiles } from "../../../tests/fixtures/profile/createProfiles";
import { populateProfiles } from "../../../tests/helpers/populateProfiles";
import * as shuffleUtils from "../../lib/shuffle";
import * as getSessionUtils from "../../lib/session/getSessionData";
import * as setSessionDataUtils from "../../lib/session/setSessionData";

const FAKE_PROFILES = createFakeProfiles(100);
const FAKE_PROFILES_IDS = FAKE_PROFILES.map((profile) => profile.id);

describe("Module: Profile", () => {
  beforeEach(async () => {
    vi.spyOn(getSessionUtils, "getSessionData").mockResolvedValueOnce({
      currentIndex: 0,
      shuffledCollection: FAKE_PROFILES_IDS,
    });

    await populateProfiles(FAKE_PROFILES, {
      prisma: prismaTestingClient,
    });
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

    it("should return subsequent profiles after first request", async () => {
      const app = await createApp();

      await app.request("/profiles", {});

      vi.spyOn(getSessionUtils, "getSessionData").mockResolvedValueOnce({
        currentIndex: 10,
        shuffledCollection: FAKE_PROFILES.map((profile) =>
          profile.id.toString()
        ),
      });

      const nextResponse = await app.request("/profiles", {});
      expect(nextResponse.status).toBe(200);

      const { profiles } = await nextResponse.json<{ profiles: Profile[] }>();

      expect(profiles).toHaveLength(10);
      expect(profiles).toIncludeSameMembers(FAKE_PROFILES.slice(10, 20));
    });

    it("should return remaining profiles if requested length is greater than amount of available profiles", async () => {
      const app = await createApp();
      const response = await app.request("/profiles?pageSize=1000", {});

      expect(response.status).toBe(200);

      const { profiles } = await response.json<{ profiles: Profile[] }>();
      expect(profiles).toHaveLength(100);
    });

    it("should return empty list if no profiles are available", async () => {
      const app = await createApp();

      await app.request("/profiles?pageSize=1000", {});

      vi.spyOn(getSessionUtils, "getSessionData").mockResolvedValueOnce({
        currentIndex: 100,
        shuffledCollection: FAKE_PROFILES_IDS,
      });

      const response = await app.request("/profiles", {});
      expect(response.status).toBe(200);

      const { profiles } = await response.json<{ profiles: Profile[] }>();

      expect(profiles).toHaveLength(0);
    });
  });

  describe("POST /profiles/reset", () => {
    it.todo("should return new profiles after list is reset");
    it.todo("should reshuffle profiles after list is reset if requested");
  });
});

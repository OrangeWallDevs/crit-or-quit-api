import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import pLimit from "p-limit";
import { logger } from "./services/logger/index.js";
import { getNormalizedBestiary } from "./services/normalizedBestiary/index.js";
import { getRawBestiary } from "./services/rawBestiary/index.js";
import { generateBio } from "./services/bios/generateBio.js";
import { wait } from "./utils/asyncUtils.js";
import { backOff } from "exponential-backoff";
import { downloadImages } from "../downloadImages.js";

const BATCH_SIZE = 300;
const baseDelay = 5;
const limit = pLimit(40);

async function loadRawBestiary() {
  const HAS_RAW_BESTIARY = existsSync("bestiary-raw.json");

  if (HAS_RAW_BESTIARY) {
    logger.info("Found previous bestiary-raw.json file, using it");
    return JSON.parse(readFileSync("bestiary-raw.json", "utf-8"));
  } else {
    logger.warning("No previous bestiary-raw.json file, creating from 5th edition data");
    const AVAILABLE_BESTIARIES = JSON.parse(readFileSync("bestiary-list.json", "utf8"));

    const rawBestiary = await getRawBestiary(
      Object.values(AVAILABLE_BESTIARIES).map(
        (value) => `https://5e.tools/data/bestiary/fluff-${value}`
      )
    );
    writeFileSync("bestiary-raw.json", JSON.stringify(rawBestiary));
    return rawBestiary;
  }
}

async function loadNormalizedBestiary(rawBestiary) {
  const HAS_NORMALIZED_BESTIARY = existsSync("bestiary-normalized.json");

  if (HAS_NORMALIZED_BESTIARY) {
    logger.info("Found previous bestiary-normalized.json file, using it");
    return JSON.parse(readFileSync("bestiary-normalized.json", "utf-8"));
  } else {
    logger.warning("No previous bestiary-normalized.json file, creating a new one from bestiary-raw.json");
    const normalizedBestiary = getNormalizedBestiary(rawBestiary);
    writeFileSync("bestiary-normalized.json", JSON.stringify(normalizedBestiary));
    return normalizedBestiary;
  }
}

function loadOrFilterProfiles(normalizedBestiary) {
  const HAS_PREVIOUS_PROFILES = existsSync("dating-profiles.json");

  if (HAS_PREVIOUS_PROFILES) {
    const currentProfiles = JSON.parse(readFileSync("dating-profiles.json", "utf-8"));

    logger.info(
      `Found previous dating-profiles.json file with ${currentProfiles.length} profiles, removing monsters that already have a dating profile`
    );

    const monstersWithProfiles = currentProfiles.map(
      (monster) => monster.meta.originalName
    );

    const filteredBestiary = normalizedBestiary.filter(
      (monster) => !monstersWithProfiles.includes(monster.name)
    );

    logger.info(`Running script to generate ${filteredBestiary.length} profiles.`);
    return { profiles: currentProfiles, bestiaryToProcess: filteredBestiary };
  } else {
    logger.warning("No previous dating-profiles.json file, all monsters will go through the API");
    return { profiles: [], bestiaryToProcess: normalizedBestiary };
  }
}

async function processBatches(batches, profiles) {
  for (const batchIndex of batches.keys()) {
    const batch = batches[batchIndex];

    logger.info(`Processing Batch ${batchIndex + 1}...`);

    const tasks = batch.map((monster) =>
      limit(async () => {
        const monsterProfile = await backOff(() => generateBio(monster), {
          startingDelay: 2_000,
          retry: ({ error }) => {
            logger.warning(
              `${monster.name} profile was rejected (${error.code}). Trying again.`
            );
            return true;
          },
        });

        logger.debug(
          `Profile for ${monster.name} created (${
            profiles.length - BATCH_SIZE * batchIndex
          }/${batch.length})`
        );
        profiles.push(monsterProfile);
      })
    );

    await Promise.all(tasks);
    writeFileSync("dating-profiles.json", JSON.stringify(profiles));

    logger.info(
      `Batch ${batchIndex + 1} processed. Waiting ${
        baseDelay * (batchIndex + 1)
      } seconds to process next batch`
    );
    await wait(baseDelay * (batchIndex + 1));
  }

  logger.info("All batches processed.");
}

async function createDatingProfiles() {
  const rawBestiary = await loadRawBestiary();
  const normalizedBestiary = await loadNormalizedBestiary(rawBestiary);
  const { profiles, bestiaryToProcess } = loadOrFilterProfiles(normalizedBestiary);

  const batches = [];
  for (let i = 0; i < bestiaryToProcess.length; i += BATCH_SIZE) {
    batches.push(bestiaryToProcess.slice(i, i + BATCH_SIZE));
  }

  logger.info(`Created ${batches.length} batches`);
  await processBatches(batches, profiles);
}

async function downloadMonsterImages() {
  if (!existsSync("images")) {
    logger.info("Creating images directory");
    mkdirSync("images");
  }

  const rawBestiary = await loadRawBestiary();
  const images = rawBestiary.filter(monster => monster.images?.length > 0).map(monster => ({
    url: `https://5e.tools/img/${encodeURIComponent(monster.images[0].href.path)}`,
    name: monster.name
  }));

  downloadImages(images, "images");
}

// createDatingProfiles();
downloadMonsterImages();
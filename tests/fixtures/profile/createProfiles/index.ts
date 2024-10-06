import type { Profile } from "@prisma/client";
import { faker } from "@faker-js/faker";

export const createFakeProfiles = (amount: number): Profile[] =>
  Array.from({ length: amount }, () => ({
    id: faker.database.mongodbObjectId(),
    name: faker.internet.userName(),
    description: faker.person.bio(),
    interests: Array.from({ length: 5 }, () => faker.lorem.word()),
    image: faker.image.url(),
    meta: {
      originalName: faker.person.fullName(),
    },
  }));

import { MongoMemoryReplSet, MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ServerApiVersion } from "mongodb";

export const setupMongoServer = async () => {
  const replicaSet = await MongoMemoryReplSet.create({
    instanceOpts: [{ port: 27017 }],
    replSet: { count: 1, name: "rs0" },
  });

  await replicaSet.waitUntilRunning();

  const connectionURL = `${replicaSet.getUri(
    "critorquit"
  )}&directConnection=true&authSource=admin`;

  const mongoClient = new MongoClient(connectionURL, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await mongoClient.connect();

  const database = mongoClient.db("critorquit");
  await database.createCollection("profiles");
};

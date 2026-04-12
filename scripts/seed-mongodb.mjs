import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI (e.g. node --env-file=.env.local scripts/seed-mongodb.mjs)");
  process.exit(1);
}

const dbName = "campfire";
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const result = await db.collection("examples").insertOne({
    message: "Hello from Campfire — seed script",
    createdAt: new Date(),
  });
  console.log("Connected. Inserted document _id:", result.insertedId.toString());
} finally {
  await client.close();
}

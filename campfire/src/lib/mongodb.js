import { MongoClient } from "mongodb";

const options = {};

let clientPromise;

function getUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment");
  }
  return uri;
}

function getOrCreateClientPromise() {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = globalThis;
    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = new MongoClient(getUri(), options).connect();
    }
    return globalWithMongo._mongoClientPromise;
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(getUri(), options).connect();
  }
  return clientPromise;
}

export async function getMongoClient() {
  return getOrCreateClientPromise();
}

/** Default app database name (override path in URI if you prefer). */
export const MONGODB_DB_NAME = "campfire";

export async function getDb() {
  const client = await getMongoClient();
  return client.db(MONGODB_DB_NAME);
}

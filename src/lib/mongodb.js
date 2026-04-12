import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI in environment');
}

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = globalThis;
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

export async function getMongoClient() {
  return clientPromise;
}

/** Default app database name (override path in URI if you prefer). */
export const MONGODB_DB_NAME = "campfire";

export async function getDb() {
  const client = await getMongoClient();
  return client.db(MONGODB_DB_NAME);
}

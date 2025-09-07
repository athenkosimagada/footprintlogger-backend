import { MongoClient } from "mongodb";
import { mongoURI } from "../config/index.js";

let dbInstance = null;
const dbName = "footprintLoggerDB";

export const connectDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  const client = new MongoClient(mongoURI);

  await client.connect();

  dbInstance = await client.db(dbName);

  return dbInstance;
};

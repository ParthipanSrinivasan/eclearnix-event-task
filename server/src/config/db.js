import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer = null;

export async function connectDatabase() {
  let uri = env.mongoUri;

  if (!uri) {
    if (env.isProduction) throw new Error("MONGO_URI must be set in production");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("event-management");
    console.warn("MONGO_URI not set: using an in-memory MongoDB. Data will be lost on restart.");
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

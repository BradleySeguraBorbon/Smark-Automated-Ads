import mongoose, { Connection } from "mongoose";

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGO_MONGODB_URI is not defined");

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

let cached = (global as any).mongoose as CachedConnection;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    }).then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;

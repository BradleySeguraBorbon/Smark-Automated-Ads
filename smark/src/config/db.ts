import mongoose from "mongoose";

export const connectDB = async () => {
    const uri: string = process.env.MONGO_URI as string;
    if (!uri) throw new Error("MONGO_URI is not defined");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
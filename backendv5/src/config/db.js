import mongoose from "mongoose";

const main = async () => {
  try {
    console.log("[Database] Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[Database] MongoDB connection established successfully");
  } catch (error) {
    console.error("[Database] MongoDB connection error:", error.message);
    throw error;
  }
};

export default main;
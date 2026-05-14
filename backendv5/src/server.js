import "dotenv/config";
import express from "express";
import main from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import CommunityRouter from "./routes/communityRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import serviceProviderRoutes from "./routes/serviceProviderRoutes.js";

import redisclient from "./config/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

// Basic middlewares
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  cors({
    origin: true, // Dynamically reflect origin to avoid mismatches
    credentials: true,
  })
);

// Serve static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Simple request logger
app.use((req, res, next) => {
  console.log(
    `[Request] ${req.method} ${req.originalUrl} - IP: ${req.ip} - Time: ${new Date().toISOString()}`
  );
  next();
});

// Health check route
app.get("/health", (req, res) => {
  console.log("[Controller] Entering Health Check");
  res.json({ status: "ok", service: "Hometown Hub API" });
});

// Attach versioned API routes
app.use("/api/auth", authRoutes);
app.use("/api/communities", CommunityRouter);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/service-providers", serviceProviderRoutes);




const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "[Startup] MONGO_URI is not defined. Please set it in your .env file."
  );
  process.exit(1);
}

console.log("[Startup] Connecting to MongoDB...");

const redisconnection = async () => {
  // await redisClient.connect();
  // console.log("redis is connected");

  // await main();
  // console.log("connected to db");
  await Promise.all([redisclient.connect(), main()])
  console.log("connected to redis and db");
  app.listen(process.env.PORT, () => {
    console.log(`[Startup] Hometown Hub API listening on port ${PORT}`);
  })
}


redisconnection();

// main()
// .then(() => {
//   console.log("[Startup] Connected to MongoDB successfully.");
//   app.listen(PORT, () => {
//     console.log(`[Startup] Hometown Hub API listening on port ${PORT}`);
//   });
// })
// .catch((err) => {
//   console.error("[Startup] MongoDB connection error:", err);
//   process.exit(1);
// });


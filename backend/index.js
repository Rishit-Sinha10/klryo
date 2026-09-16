import { app } from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
/**
 * ✅ FIX: Connect to MongoDB
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn(
        "⚠️  [DB] MONGODB_URI is not set in .env - Chat features will not work",
      );
      return false;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ [DB] MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ [DB] MongoDB connection failed:", error.message);
    return false;
  }
};
/**
 * ✅ ADD: Health check endpoint for debugging
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    mongoConnected: mongoose.connection.readyState === 1,
    uptime: process.uptime(),
  });
});
/**
 * ✅ ADD: Root endpoint
 */
app.get("/", (req, res) => {
  res.json({
    message: "klyro Backend v1.0",
    status: "running",
    timestamp: new Date(),
  });
});
/**
 * ✅ ADD: Startup sequence
 */
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  console.log("\n🚀 Starting klyro Backend Server...\n");
  // Connect to MongoDB first
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn("⚠️  Continuing without MongoDB. Chat features disabled.\n");
  }
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}\n`);
    console.log("Environment Status:");
    console.log(
      `  ✓ GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "✓ Loaded" : "✗ Missing"}`,
    );
    console.log(
      `  ${process.env.JUDGE0_URL ? "✓" : "✗"} JUDGE0_URL: ${process.env.JUDGE0_URL || "http://localhost:2358 (default)"}`,
    );
    console.log(
      `  ${process.env.MONGODB_URI ? "✓" : "✗"} MONGODB_URI: ${process.env.MONGODB_URI ? "✓ Loaded" : "✗ Missing (Chat disabled)"}`,
    );
    console.log(
      `  ✓ MongoDB Status: ${mongoose.connection.readyState === 1 ? "✓ Connected" : "✗ Not Connected"}\n`,
    );
    console.log("Available Endpoints:");
    console.log(`  GET  http://localhost:${PORT}/health`);
    console.log(`  POST http://localhost:${PORT}/api/run-code`);
    console.log(`  GET  http://localhost:${PORT}/api/chats`);
    console.log("");
  });
};
startServer();

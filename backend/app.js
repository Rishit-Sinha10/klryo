import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import rateLimit from "express-rate-limit";

dotenv.config();

import aiRoutes from "./route/ai.route.js";
import chatRoutes from "./route/chat.route.js";
import projectRoutes from "./route/project.route.js";
import codeHistoryRoutes from "./route/codeHistory.route.js";
import formatRoutes from "./route/format.route.js";
import codeRoutes from "./route/code.route.js";
import { HandleLanguages } from "./controller/languages.controller.js";
import { getSharedProject } from "./controller/project.controller.js";

export const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://klyro.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit exceeded, please try again later" },
});
const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Code execution rate limit exceeded" },
});

app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/chats", generalLimiter, chatRoutes);
app.use("/api/projects", generalLimiter, projectRoutes);
app.use("/api/runs", generalLimiter, codeHistoryRoutes);
app.use("/api/format", generalLimiter, formatRoutes);
app.use("/api/run-code", codeLimiter, codeRoutes);
app.get("/api/languages", HandleLanguages);
app.get("/api/share/:shareId", getSharedProject);

app.use((err, req, res, next) => {
  console.error("[UNHANDLED_ERROR]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

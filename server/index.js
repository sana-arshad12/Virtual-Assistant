import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// CORS configuration - Add this BEFORE other middlewares
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

// Start server with automatic fallback if port is busy
const basePort = parseInt(process.env.PORT, 10) || 5000;

const startServer = (portToTry, attempt = 1, maxAttempts = 10) => {
  const server = app.listen(portToTry, () => {
    if (attempt > 1) {
      console.log(`⚠️  Using fallback port (original busy).`);
    }
    console.log(`🚀 Server running at http://localhost:${portToTry}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (attempt < maxAttempts) {
        const nextPort = portToTry + 1;
        console.warn(`Port ${portToTry} in use, trying ${nextPort}... (attempt ${attempt + 1}/${maxAttempts})`);
        startServer(nextPort, attempt + 1, maxAttempts);
      } else {
        console.error(`Failed to find a free port after ${maxAttempts} attempts.`);
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
};

// Graceful shutdown
const graceful = () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
};
process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);

// Initialize (connect DB first, then start server)
(async () => {
  try {
    await connectDB();
    startServer(basePort);
  } catch (err) {
    console.error("Failed to initialize application:", err.message);
    process.exit(1);
  }
})();

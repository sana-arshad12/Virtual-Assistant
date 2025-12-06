import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import aiRouter from "./routes/ai.routes.js";
import systemRouter from "./routes/system.routes.js";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from 'http-proxy-middleware'
import { spawn } from 'child_process'

dotenv.config();

const app = express();

// CORS configuration - Allow local development and Vercel domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", 
  "http://localhost:5175",
  "https://virtual-assistant-client.vercel.app", // Update this with your actual Vercel frontend URL
  /\.vercel\.app$/ // Allow all Vercel preview deployments
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

// Health route
app.get("/health", (req, res) => {
  console.log('💚 Health check requested');
  res.json({ status: "ok", port: process.env.PORT || 'unknown', timestamp: new Date().toISOString() });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test AI endpoint (temporary for debugging)
app.post("/test-ai", async (req, res) => {
  try {
    console.log('🧪 TEST AI endpoint hit:', req.body);
    const { generateAIResponse } = await import('./config/gemini.js');
    const result = await generateAIResponse(req.body.message || 'Hello', 'voice', []);
    res.json({ success: true, result });
  } catch (error) {
    console.error('🧪 TEST AI error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);
app.use("/api/system", systemRouter);

// Auto-start Python executor and proxy
const PY_HOST = process.env.PY_HOST || 'localhost'
const PY_PORT = parseInt(process.env.PY_PORT, 10) || 8080
const PY_URL = process.env.PY_EXECUTOR_URL || `http://${PY_HOST}:${PY_PORT}`

let pyProcess = null
const startPython = () => {
  if (pyProcess) return
  // Use 'py' on Windows, 'python3' or 'python' on other systems
  const pythonCmd = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'py' : 'python3')
  const scriptPath = process.env.PY_SCRIPT || '../python-executor/api_server.py'
  const args = [scriptPath, '--host', PY_HOST, '--port', String(PY_PORT)]
  console.log(`🟡 Starting python executor: ${pythonCmd} ${args.join(' ')}`)
  pyProcess = spawn(pythonCmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  pyProcess.on('exit', (code, signal) => {
    console.log(`🔴 Python executor exited code=${code} signal=${signal}`)
    pyProcess = null
  })
}

// Start python executor in dev only unless forced
if (process.env.START_PY_EXECUTOR !== 'false') {
  startPython()
}

// Proxy system endpoints to python executor (disabled - using Node.js implementation)
/*
app.use('/api/system', createProxyMiddleware({
  target: PY_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/system': ''
  },
  onError(err, req, res) {
    console.error('Proxy error:', err.message)
    res.status(502).json({ success: false, message: 'Python executor not available' })
  }
}))
*/

// Start server with automatic fallback if port is busy
const basePort = parseInt(process.env.PORT, 10) || 8000;

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
  if (pyProcess && !pyProcess.killed) {
    try { pyProcess.kill(); } catch {}
  }
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

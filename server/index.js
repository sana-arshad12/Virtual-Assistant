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

// Parse JSON FIRST (before CORS)
app.use(express.json());
app.use(cookieParser());

// CORS Configuration - Must be after body parsing
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development and production
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept');
  res.sendStatus(200);
});

// Health route
app.get("/health", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
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

// Auto-start Python executor (only in local development)
const PY_HOST = process.env.PY_HOST || 'localhost'
const PY_PORT = parseInt(process.env.PY_PORT, 10) || 8080
const PY_URL = process.env.PY_EXECUTOR_URL || `http://${PY_HOST}:${PY_PORT}`

let pyProcess = null
const startPython = () => {
  // Don't start Python in serverless environments
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('⚠️  Python executor disabled in serverless environment')
    return
  }
  
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

// Start server with automatic fallback if port is busy (only in local mode)
const basePort = parseInt(process.env.PORT, 10) || 8000;

// Check if running on Vercel
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

if (!isVercel) {
  // Local development mode
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
} else {
  // Vercel serverless mode - just connect to database
  console.log('🌐 Running in Vercel serverless mode');
  connectDB().catch(err => {
    console.error('MongoDB connection failed:', err.message);
  });
}

// Export for Vercel (this will be used only when deployed to Vercel)
export default app;

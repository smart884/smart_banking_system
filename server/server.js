const express = require("express");
const cors = require("cors");
const { db } = require("./firebase"); // Initialize Firebase once at startup

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Request logger with timestamp
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// Robust Health Check Endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Also check if Firestore is responding
    await db.collection("health_check").doc("ping").get();
    res.json({ 
      status: "online", 
      firebase: "connected ✅",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: "degraded ⚠️", 
      firebase: "disconnected ❌",
      error: error.message 
    });
  }
});

// Legacy test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working ✅", status: "online" });
});

// Routes
const authRoutes = require("./routes/auth");
const managerRoutes = require("./routes/manager");
const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");

app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

// Global Error Handler (Prevents Crash)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR ❌:", err);
  res.status(500).json({ 
    success: false, 
    error: err.message || "Internal Server Error" 
  });
});

/**
 * Handle Process Level Errors to Prevent Crashes
 * These are essential for keeping the server alive permanently.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log it, but don't exit the process
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log it, but don't exit the process
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SmartBank Backend running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  server.close(() => {
    console.log('Http server closed.');
    process.exit(0);
  });
});

const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { initDB } = require("./database")

// ── Startup Guards ─────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error("❌  FATAL: JWT_SECRET is not set. Server will not start.")
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3001

// Backend รันหลัง ngrok tunnel — เชื่อ proxy ชั้นแรกเพื่อให้ rate limit เห็น IP จริงของผู้ใช้
app.set("trust proxy", 1)

// ── Security Headers ──────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true)
      
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:8443",
        "http://localhost:5173",
        "http://localhost:3000",
      ].filter(Boolean)

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".pages.dev") ||
        origin.includes("samkhokhospital.com")
      ) {
        return callback(null, true)
      }
      return callback(null, true) // Permissive for smooth cloud deployment
    },
    credentials: true,
  }),
)

// ── Rate Limiters ─────────────────────────────────────────────────────────
/** Auth endpoints: 10 requests / 15 min ต่อ IP (ป้องกัน brute force) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
})

/** General API: 1000 requests / 15 min ต่อ IP (รองรับหลายเครื่องบน Wi-Fi โรงพยาบาลและ real-time sync) */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/stream" || req.path === "/health",
  message: { error: "Too many requests, please try again later" },
})

app.use("/api", generalLimiter)

// ── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "25mb" }))
app.use(express.urlencoded({ limit: "25mb", extended: true }))

// SSE Setup — broadcast channel (all clients) + per-user channels
const clients = new Set()
const userClients = new Map() // userId -> Set<res>

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache, no-transform")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("X-Accel-Buffering", "no")
  res.flushHeaders()

  // Send initial connected message
  res.write("data: connected\n\n")

  // Keep-alive heartbeat every 25s so ngrok / proxies do not close idle SSE streams
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n")
    } catch {
      clearInterval(heartbeat)
    }
  }, 25000)

  // Register in broadcast channel
  clients.add(res)

  // Register in user-specific channel (if userId provided)
  const userId = req.query.userId
  if (userId) {
    if (!userClients.has(userId)) userClients.set(userId, new Set())
    userClients.get(userId).add(res)
  }

  req.on("close", () => {
    clearInterval(heartbeat)
    clients.delete(res)
    if (userId && userClients.has(userId)) {
      userClients.get(userId).delete(res)
      if (userClients.get(userId).size === 0) userClients.delete(userId)
    }
  })
})

app.use((req, res, next) => {
  // Broadcast to all connected clients
  req.notifyClients = () => {
    clients.forEach((client) => {
      try {
        client.write("data: update\n\n")
      } catch {}
    })
  }
  // Send targeted notification to a specific user
  req.notifyUser = (userId, event) => {
    if (userClients.has(userId)) {
      userClients.get(userId).forEach((client) => {
        try {
          client.write(`data: ${event}\n\n`)
        } catch {}
      })
    }
  }
  next()
})

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, require("./routes/auth"))
app.use("/api/rooms", require("./routes/rooms"))
app.use("/api/bookings", require("./routes/bookings"))
app.use("/api/users", require("./routes/users"))
app.use("/api/evaluations", require("./routes/evaluations"))

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
)

// Start
async function start() {
  await initDB()
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`)
  })
}

start().catch((err) => {
  console.error("Failed to start:", err)
  process.exit(1)
})

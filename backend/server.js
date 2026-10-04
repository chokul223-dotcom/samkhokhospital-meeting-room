require("dotenv").config()
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

// ── Security Headers ──────────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────────
// อนุญาตเฉพาะ origin ที่ตั้งใน FRONTEND_URL (หรือ localhost สำหรับ dev)
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:8443"
app.use(
  cors({
    origin: allowedOrigin,
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

/** General API: 200 requests / 15 min ต่อ IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
})

app.use("/api", generalLimiter)

// ── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// SSE Setup — broadcast channel (all clients) + per-user channels
const clients = new Set()
const userClients = new Map() // userId -> Set<res>

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.flushHeaders()

  // Send initial connected message
  res.write("data: connected\n\n")

  // Register in broadcast channel
  clients.add(res)

  // Register in user-specific channel (if userId provided)
  const userId = req.query.userId
  if (userId) {
    if (!userClients.has(userId)) userClients.set(userId, new Set())
    userClients.get(userId).add(res)
  }

  req.on("close", () => {
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
    clients.forEach((client) => client.write("data: update\n\n"))
  }
  // Send targeted notification to a specific user
  req.notifyUser = (userId, event) => {
    if (userClients.has(userId)) {
      userClients.get(userId).forEach((client) =>
        client.write(`data: ${event}\n\n`)
      )
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

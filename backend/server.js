require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initDB } = require('./database')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// SSE Setup
const clients = new Set()

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Send initial connected message
  res.write('data: connected\n\n')

  clients.add(res)
  req.on('close', () => {
    clients.delete(res)
  })
})

app.use((req, res, next) => {
  req.notifyClients = () => {
    clients.forEach(client => client.write('data: update\n\n'))
  }
  next()
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/rooms', require('./routes/rooms'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/users', require('./routes/users'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Start
async function start() {
  await initDB()
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`)
  })
}

start().catch(err => {
  console.error('Failed to start:', err)
  process.exit(1)
})

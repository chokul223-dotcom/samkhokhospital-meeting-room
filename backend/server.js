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

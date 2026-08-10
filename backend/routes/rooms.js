const router = require('express').Router()
const { pool } = require('../database')
const { authMiddleware } = require('../middleware/auth')

// GET /api/rooms — all rooms
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY name')
    res.json(result.rows.map(r => ({
      id: r.id, name: r.name, capacity: r.capacity,
      location: r.location, equipment: r.equipment, status: r.status
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/rooms/:id/status — admin toggle maintenance
router.patch('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { status } = req.body
  try {
    await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', [status, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

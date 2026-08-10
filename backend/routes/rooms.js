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

// POST /api/rooms — create room
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { id, name, capacity, location, equipment } = req.body
  try {
    await pool.query(
      'INSERT INTO rooms (id, name, capacity, location, equipment) VALUES ($1, $2, $3, $4, $5)',
      [id, name, capacity, location, equipment || []]
    )
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/rooms/:id — update room
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { name, capacity, location, equipment } = req.body
  try {
    await pool.query(
      'UPDATE rooms SET name = $1, capacity = $2, location = $3, equipment = $4 WHERE id = $5',
      [name, capacity, location, equipment || [], req.params.id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/rooms/:id — delete room
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  try {
    // Delete associated bookings first
    await pool.query('DELETE FROM bookings WHERE room_id = $1', [req.params.id])
    await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

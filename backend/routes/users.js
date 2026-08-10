const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { pool } = require('../database')
const { authMiddleware } = require('../middleware/auth')

// GET /api/users — admin only
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  try {
    const result = await pool.query('SELECT id, name, department, role, username, created_at FROM users ORDER BY name')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/users — admin creates user
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  const { name, department, role, username, password } = req.body
  if (!name || !username || !password) return res.status(400).json({ error: 'Missing fields' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const id = 'u' + Date.now()
    await pool.query(
      'INSERT INTO users (id, name, department, role, username, password) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, name, department || '-', role || 'user', username, hash]
    )
    res.status(201).json({ id, name, department, role, username })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username already exists' })
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/users/:id — admin deletes user
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' })
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/users/:id/password — change own password
router.patch('/:id/password', authMiddleware, async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Missing password' })
  try {
    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

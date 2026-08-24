const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { pool } = require("../database")

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ error: "Missing credentials" })

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: "Invalid credentials" })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: "Invalid credentials" })

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    )
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        department: user.department,
        role: user.role,
        username: user.username,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router

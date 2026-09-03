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
        emailVerified: user.email_verified,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/auth/reset-password — public, validate token and set new password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body
  if (!token || !password)
    return res.status(400).json({ error: "Missing token or password" })
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" })

  try {
    const result = await pool.query(
      `SELECT prt.*, u.id as uid FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token],
    )
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Token ไม่ถูกต้องหรือหมดอายุแล้ว" })

    const row = result.rows[0]
    const hash = await bcrypt.hash(password, 10)

    // Update password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, row.user_id])

    // Mark token as used
    await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE id = $1", [row.id])

    res.json({ success: true, message: "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// GET /api/auth/verify-reset-token — check if token is still valid
router.get("/verify-reset-token", async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ valid: false })

  try {
    const result = await pool.query(
      `SELECT prt.expires_at, u.name, u.username
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token],
    )
    if (result.rows.length === 0) return res.json({ valid: false })
    const row = result.rows[0]
    res.json({ valid: true, name: row.name, username: row.username, expiresAt: row.expires_at })
  } catch (err) {
    res.status(500).json({ valid: false })
  }
})

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: "Missing token" })

  try {
    const result = await pool.query(
      `SELECT * FROM email_verify_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
      [token]
    )
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว" })
    }

    const row = result.rows[0]

    // Update user and token
    await pool.query("UPDATE users SET email_verified = TRUE WHERE id = $1", [row.user_id])
    await pool.query("UPDATE email_verify_tokens SET used = TRUE WHERE id = $1", [row.id])

    res.json({ success: true, message: "ยืนยันอีเมลสำเร็จ" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router


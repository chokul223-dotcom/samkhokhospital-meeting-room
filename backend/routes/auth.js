const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { pool } = require("../database")
const { validateLogin, validateRegister } = require("../middleware/validate")

// POST /api/auth/register — public, register new user (pending approval)
router.post("/register", validateRegister, async (req, res) => {
  const { email, username, password, name } = req.body
  if (!email || !password || !name)
    return res.status(400).json({ error: "Missing required fields" })
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" })

  try {
    // Check duplicate email or username
    const emailNorm = email.toLowerCase().trim()
    const uname = username || emailNorm.split("@")[0]
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [emailNorm, uname]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email or username already exists" })
    }

    const hash = await bcrypt.hash(password, 10)
    const id = "u" + Date.now()

    await pool.query(
      "INSERT INTO users (id, name, department, role, username, email, password) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [id, name.trim(), "รอการตรวจสอบ", "user", uname, emailNorm, hash]
    )

    // Notify admin clients via SSE so admin sees new user immediately
    if (req.notifyClients) req.notifyClients()

    res.status(201).json({
      success: true,
      user: { id, name: name.trim(), department: "รอการตรวจสอบ", role: "user", username: uname, email: emailNorm }
    })
  } catch (err) {
    console.error("register error:", err)
    if (err.code === "23505")
      return res.status(409).json({ error: "Email or username already exists" })
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/auth/login
router.post("/login", validateLogin, async (req, res) => {
  const { email, password, trustedDeviceToken } = req.body
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" })

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: "Email not found" })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: "Invalid password" })

    // Check trusted device token
    if (trustedDeviceToken) {
      try {
        const decoded = jwt.verify(trustedDeviceToken, process.env.JWT_SECRET)
        if (decoded.id === user.id && decoded.type === 'trusted_device') {
          // Skip 2FA
          const token = jwt.sign(
            {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              name: user.name,
              department: user.department,
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
          )
          return res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              department: user.department,
              role: user.role,
              username: user.username,
              email: user.email,
              emailVerified: user.email_verified,
            }
          })
        }
      } catch (e) {
        // Token invalid or expired, ignore and proceed to 2FA
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate old OTPs
    await pool.query("UPDATE two_factor_tokens SET used = TRUE WHERE user_id = $1", [user.id])
    
    // Save new OTP
    await pool.query("INSERT INTO two_factor_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [user.id, otp, expiresAt])

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey && user.email) {
      const { Resend } = require("resend")
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from: process.env.SMTP_FROM || "eBooking Samkhok Hospital <onboarding@resend.dev>",
        to: user.email,
        subject: "รหัสยืนยันการเข้าสู่ระบบ (2FA) - eBooking Samkhok Hospital",
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>รหัสยืนยันตัวตน 6 หลักของคุณคือ</h2>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #2563eb;">${otp}</h1>
            <p>รหัสนี้มีอายุการใช้งาน 10 นาที โปรดอย่านำรหัสนี้ไปให้ผู้อื่น</p>
          </div>
        `
      }).catch(console.error)
    }

    res.json({
      require2FA: true,
      userId: user.id,
      email: user.email,
      message: "OTP sent to email"
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/auth/verify-2fa
router.post("/verify-2fa", async (req, res) => {
  const { userId, code, rememberMe } = req.body
  if (!userId || !code) return res.status(400).json({ error: "Missing required fields" })

  try {
    const result = await pool.query(
      "SELECT * FROM two_factor_tokens WHERE user_id = $1 AND token = $2 AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [userId, code]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "รหัสยืนยันไม่ถูกต้อง หรือหมดอายุแล้ว" })
    }

    // Mark as used
    await pool.query("UPDATE two_factor_tokens SET used = TRUE WHERE id = $1", [result.rows[0].id])

    // Fetch user and generate real token
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId])
    const user = userResult.rows[0]

    const expiresIn = rememberMe ? "30d" : "8h"

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn }
    )

    let trustedDeviceToken = undefined
    if (rememberMe) {
      trustedDeviceToken = jwt.sign(
        { id: user.id, type: 'trusted_device' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
      )
    }

    res.json({
      token,
      trustedDeviceToken,
      user: {
        id: user.id,
        name: user.name,
        department: user.department,
        role: user.role,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
      }
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


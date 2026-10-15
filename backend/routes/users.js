const router = require("express").Router()
const bcrypt = require("bcryptjs")
const { pool } = require("../database")
const { authMiddleware } = require("../middleware/auth")
const { validateUserCreate } = require("../middleware/validate")

// GET /api/users — admin only
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" })
  try {
    const result = await pool.query(
      "SELECT id, member_id, name, department, role, username, email, email_verified, created_at FROM users ORDER BY name",
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/users — admin creates user
router.post("/", authMiddleware, validateUserCreate, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" })
  const { name, department, role, username, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" })

  try {
    const hash = await bcrypt.hash(password, 10)
    const id = "u" + Date.now()
    // Use email as username if username not provided
    const uname = username || email.split("@")[0]
    await pool.query(
      "INSERT INTO users (id, name, department, role, username, email, password) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [id, name, department || "-", role || "user", uname, email.toLowerCase().trim(), hash],
    )
    if (req.notifyClients) req.notifyClients()
    res.status(201).json({ id, name, department, role, username: uname, email })
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Email or username already exists" })
    res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/users/:id — admin edits user OR user edits themselves
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.id)
    return res.status(403).json({ error: "Forbidden" })
  const { name, role: reqRole, username, email, password } = req.body
  let { department } = req.body
  if (!name || !reqRole)
    return res.status(400).json({ error: "Missing fields" })

  try {
    const userRes = await pool.query("SELECT username, email, department, role FROM users WHERE id = $1", [req.params.id])
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" })

    const prevDepartment = userRes.rows[0].department
    const isAdmin = req.user.role === "admin"
    // Non-admins cannot change their own role
    const role = isAdmin ? reqRole : userRes.rows[0].role
    // Non-admins cannot change department while pending admin approval
    const prevIsPending = !prevDepartment || prevDepartment === "รอการตรวจสอบ" || prevDepartment === "-"
    if (!isAdmin && prevIsPending) department = prevDepartment
    const newEmail = email ? email.toLowerCase().trim() : userRes.rows[0].email
    const newUsername = username || userRes.rows[0].username
    // email_verified: reset to false only when email actually changes
    const isEmailChanged = email && userRes.rows[0].email !== newEmail

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      await pool.query(
        `UPDATE users
         SET name = $1,
             department = $2,
             role = $3,
             username = $4,
             email = $5,
             password = $6,
             email_verified = CASE WHEN $7 THEN FALSE ELSE email_verified END
         WHERE id = $8`,
        [name, department || "-", role, newUsername, newEmail, hash, isEmailChanged, req.params.id],
      )
    } else {
      await pool.query(
        `UPDATE users
         SET name = $1,
             department = $2,
             role = $3,
             username = $4,
             email = $5,
             email_verified = CASE WHEN $6 THEN FALSE ELSE email_verified END
         WHERE id = $7`,
        [name, department || "-", role, newUsername, newEmail, isEmailChanged, req.params.id],
      )
    }

    // Notify all clients about user list change
    if (req.notifyClients) req.notifyClients()

    // If admin is approving a pending user (department changed from "รอการตรวจสอบ")
    const wasPending = prevDepartment === "รอการตรวจสอบ" || prevDepartment === "-"
    const isNowApproved = department && department !== "รอการตรวจสอบ" && department !== "-"
    if (req.user.role === "admin" && wasPending && isNowApproved && req.notifyUser) {
      req.notifyUser(req.params.id, "user_approved")
    }

    res.json({ id: req.params.id, name, department, role, username: newUsername, email: newEmail, emailVerified: !isEmailChanged })
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "Email or username already exists" })
    res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/users/:id — admin deletes user
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" })
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: "Cannot delete yourself" })
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id])
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// PATCH /api/users/:id/password — change own password
router.patch("/:id/password", authMiddleware, async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" })
  }
  const { oldPassword, password } = req.body
  if (!password) return res.status(400).json({ error: "Missing password" })
  
  try {
    // If user is changing their own password, verify old password
    if (req.params.id === req.user.id) {
      if (!oldPassword) return res.status(400).json({ error: "Missing old password" })
      const userRes = await pool.query("SELECT password FROM users WHERE id = $1", [req.params.id])
      if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" })
      const match = await bcrypt.compare(oldPassword, userRes.rows[0].password)
      if (!match) return res.status(401).json({ error: "รหัสผ่านเดิมไม่ถูกต้อง" })
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hash,
      req.params.id,
    ])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/users/:id/send-reset — admin sends password reset email
router.post("/:id/send-reset", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" })

  try {
    // Get user (include email for sending)
    const result = await pool.query(
      "SELECT id, name, username, email FROM users WHERE id = $1",
      [req.params.id],
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" })
    if (!result.rows[0].email)
      return res.status(400).json({ error: "User has no email address" })

    const user = result.rows[0]

    // Generate token
    const crypto = require("crypto")
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Invalidate old tokens for this user
    await pool.query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE",
      [user.id],
    )

    // Save new token
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt],
    )

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8443"
    const resetLink = `${frontendUrl}?reset_token=${token}`

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Dev fallback: return token in response for testing
      console.warn("⚠️  RESEND_API_KEY not set — returning token for dev testing")
      return res.json({
        success: true,
        dev_token: token,
        reset_link: resetLink,
        message: "Dev mode: RESEND_API_KEY not set",
      })
    }

    const { Resend } = require("resend")
    const resend = new Resend(apiKey)

    const fromEmail = process.env.SMTP_FROM || "onboarding@resend.dev"
    const hospitalName = "eBooking Samkhok Hospital"

    const { error: emailError } = await resend.emails.send({
      from: `${hospitalName} <${fromEmail}>`,
      to: [user.email],
      subject: "รีเซ็ตรหัสผ่าน — ระบบจองห้องประชุม โรงพยาบาลสามโคก",
      html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Sarabun',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8,#0e7490);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">🏥 โรงพยาบาลสามโคก</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">ระบบจองห้องประชุมออนไลน์</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">สวัสดีคุณ ${user.name}</h2>
            <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
              ผู้ดูแลระบบได้ส่งคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ<br>
              กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุภายใน <strong>1 ชั่วโมง</strong>
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}"
                 style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0e7490);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                🔑 ตั้งรหัสผ่านใหม่
              </a>
            </div>
            <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
              หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้<br>
              หรือติดต่อผู้ดูแลระบบทันที
            </p>
            <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              ลิงก์นี้จะใช้ได้ถึง: <strong>${expiresAt.toLocaleString("th-TH")}</strong><br>
              อีเมลนี้ส่งถึง: ${user.email}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">โรงพยาบาลสามโคก • ระบบจองห้องประชุมออนไลน์</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    if (emailError) {
      console.error("Resend error:", emailError)
      return res.status(500).json({ error: "Failed to send email: " + emailError.message })
    }

    res.json({ success: true, message: "Reset email sent to " + user.email })
  } catch (err) {
    console.error("send-reset error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/users/:id/send-verify-email
router.post("/:id/send-verify-email", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Forbidden" })
  }

  try {
    const result = await pool.query("SELECT id, member_id, name, username, email, email_verified FROM users WHERE id = $1", [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" })
    
    const user = result.rows[0]
    if (user.email_verified) {
      return res.status(400).json({ error: "Email already verified" })
    }

    const crypto = require("crypto")
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day

    // Invalidate old tokens
    await pool.query(
      "UPDATE email_verify_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE",
      [user.id]
    )

    // Save new token
    await pool.query(
      "INSERT INTO email_verify_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt]
    )

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8443"
    const verifyLink = `${frontendUrl}?verify_email_token=${token}`

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return res.json({
        success: true,
        dev_token: token,
        verify_link: verifyLink,
        message: "Dev mode: RESEND_API_KEY not set",
      })
    }

    const { Resend } = require("resend")
    const resend = new Resend(apiKey)
    const fromEmail = process.env.SMTP_FROM || "onboarding@resend.dev"
    const hospitalName = "eBooking Samkhok Hospital"

    const { error: emailError } = await resend.emails.send({
      from: `${hospitalName} <${fromEmail}>`,
      to: [user.email],
      subject: "ยืนยันอีเมลของคุณ — ระบบจองห้องประชุม โรงพยาบาลสามโคก",
      html: `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Sarabun',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8,#0e7490);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">🏥 โรงพยาบาลสามโคก</h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">ระบบจองห้องประชุมออนไลน์</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">สวัสดีคุณ ${user.name}</h2>
            <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
              กรุณากดปุ่มด้านล่างเพื่อยืนยันที่อยู่อีเมลของคุณ ลิงก์นี้จะหมดอายุภายใน <strong>24 ชั่วโมง</strong>
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${verifyLink}"
                 style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0e7490);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                ✅ ยืนยันอีเมล
              </a>
            </div>
            <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
              หากคุณไม่ได้แก้ไขอีเมล กรุณาเพิกเฉยต่ออีเมลนี้
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    if (emailError) {
      console.error("Resend error:", JSON.stringify(emailError))
      return res.status(500).json({ error: "Failed to send email: " + (emailError.message || JSON.stringify(emailError)) })
    }

    res.json({ success: true, message: "Verification email sent to " + user.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router


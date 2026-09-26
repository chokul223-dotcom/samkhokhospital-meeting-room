/**
 * Input Validation & Sanitization Middleware
 * ป้องกัน malformed input ก่อนถึง business logic
 */

/** ตัด null byte และ trim whitespace */
function sanitizeString(str) {
  if (typeof str !== "string") return str
  return str.replace(/\0/g, "").trim()
}

/** ตรวจ email format เบื้องต้น */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** POST /api/auth/login */
function validateLogin(req, res, next) {
  let { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" })

  email = sanitizeString(email)
  if (!isValidEmail(email))
    return res.status(400).json({ error: "Invalid email format" })

  if (typeof password !== "string" || password.length > 200)
    return res.status(400).json({ error: "Invalid password" })

  // เขียนกลับ body ที่ sanitize แล้ว
  req.body.email = email
  next()
}

/** POST /api/auth/register */
function validateRegister(req, res, next) {
  let { email, password, name, username } = req.body

  if (!email || !password || !name)
    return res.status(400).json({ error: "Missing required fields" })

  email = sanitizeString(email)
  if (!isValidEmail(email))
    return res.status(400).json({ error: "Invalid email format" })

  if (typeof password !== "string" || password.length < 6 || password.length > 200)
    return res
      .status(400)
      .json({ error: "Password must be 6–200 characters" })

  name = sanitizeString(name)
  if (name.length < 1 || name.length > 100)
    return res.status(400).json({ error: "Name must be 1–100 characters" })

  if (username) {
    username = sanitizeString(username)
    if (username.length > 50 || /\s/.test(username))
      return res
        .status(400)
        .json({ error: "Username must be ≤50 chars with no spaces" })
    req.body.username = username
  }

  req.body.email = email
  req.body.name = name
  next()
}

/** POST /api/users — admin creates user */
function validateUserCreate(req, res, next) {
  let { name, email, password, username, department, role } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" })

  email = sanitizeString(email)
  if (!isValidEmail(email))
    return res.status(400).json({ error: "Invalid email format" })

  name = sanitizeString(name)
  if (name.length < 1 || name.length > 100)
    return res.status(400).json({ error: "Name must be 1–100 characters" })

  if (typeof password !== "string" || password.length < 6 || password.length > 200)
    return res.status(400).json({ error: "Password must be 6–200 characters" })

  const allowedRoles = ["admin", "user"]
  if (role && !allowedRoles.includes(role))
    return res.status(400).json({ error: "Invalid role" })

  req.body.email = email
  req.body.name = name
  if (username) req.body.username = sanitizeString(username)
  if (department) req.body.department = sanitizeString(department)
  next()
}

module.exports = { validateLogin, validateRegister, validateUserCreate }

const router = require("express").Router()
const jwt = require("jsonwebtoken")
const rateLimit = require("express-rate-limit")
const { pool } = require("../database")
const { authMiddleware, adminOnly } = require("../middleware/auth")

// ── รายการข้อคำถาม (ต้องตรงกับ src/constants/evaluation.ts) ────────────────
const QUESTION_IDS = ["q1_1", "q1_2", "q1_3"]
const MAX_SUGGESTION_LENGTH = 2000

/** จำกัดการส่งแบบประเมิน: 10 ครั้ง / ชั่วโมง ต่อ IP (กันสแปม) */
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later" },
})

/** อ่าน user จาก token ถ้ามี (ไม่บังคับ login) */
function optionalUserId(req) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded?.id || null
  } catch {
    return null
  }
}

// POST /api/evaluations — ส่งแบบประเมิน (ไม่บังคับ login)
router.post("/", submitLimiter, async (req, res) => {
  const { answers, suggestion } = req.body || {}

  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid answers" })
  }

  const cleanAnswers = {}
  for (const qid of QUESTION_IDS) {
    const score = Number(answers[qid])
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ error: `Missing or invalid score for ${qid}` })
    }
    cleanAnswers[qid] = score
  }

  const cleanSuggestion =
    typeof suggestion === "string"
      ? suggestion.trim().slice(0, MAX_SUGGESTION_LENGTH) || null
      : null

  try {
    const result = await pool.query(
      "INSERT INTO evaluations (user_id, answers, suggestion) VALUES ($1, $2, $3) RETURNING id",
      [optionalUserId(req), JSON.stringify(cleanAnswers), cleanSuggestion],
    )
    res.json({ success: true, id: result.rows[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// GET /api/evaluations/summary — สรุปผลการประเมิน (admin เท่านั้น)
router.get("/summary", authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalRes = await pool.query("SELECT COUNT(*)::int AS total FROM evaluations")
    const total = totalRes.rows[0].total

    const questions = {}
    for (const qid of QUESTION_IDS) {
      const r = await pool.query(
        `SELECT (answers->>$1)::int AS score, COUNT(*)::int AS count
           FROM evaluations
          WHERE answers ? $1
          GROUP BY score`,
        [qid],
      )
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let sum = 0
      let n = 0
      for (const row of r.rows) {
        if (row.score >= 1 && row.score <= 5) {
          distribution[row.score] = row.count
          sum += row.score * row.count
          n += row.count
        }
      }
      questions[qid] = { average: n ? sum / n : 0, count: n, distribution }
    }

    const suggestionsRes = await pool.query(
      `SELECT e.id, e.suggestion, e.created_at, u.name AS user_name
         FROM evaluations e
         LEFT JOIN users u ON u.id = e.user_id
        WHERE e.suggestion IS NOT NULL AND e.suggestion <> ''
        ORDER BY e.created_at DESC
        LIMIT 20`,
    )

    res.json({
      total,
      questions,
      suggestions: suggestionsRes.rows.map((s) => ({
        id: s.id,
        suggestion: s.suggestion,
        createdAt: s.created_at,
        userName: s.user_name || null,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router

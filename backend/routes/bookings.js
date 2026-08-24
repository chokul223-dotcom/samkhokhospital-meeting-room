const router = require("express").Router()
const { pool } = require("../database")
const { authMiddleware } = require("../middleware/auth")

// GET /api/bookings — returns own bookings (user) or all (admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let result
    if (req.user.role === "admin") {
      result = await pool.query(
        "SELECT * FROM bookings ORDER BY date DESC, start_time",
      )
    } else {
      result = await pool.query(
        "SELECT * FROM bookings WHERE user_id = $1 ORDER BY date DESC, start_time",
        [req.user.id],
      )
    }
    res.json(
      result.rows.map((b) => ({
        id: b.id,
        roomId: b.room_id,
        userId: b.user_id,
        date: b.date,
        startTime: b.start_time,
        endTime: b.end_time,
        purpose: b.purpose,
        attendees: b.attendees,
        status: b.status,
        rejectReason: b.reject_reason || null,
        createdAt: b.created_at,
      })),
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/bookings — create booking
router.post("/", authMiddleware, async (req, res) => {
  const { roomId, date, startTime, endTime, purpose, attendees } = req.body
  if (!roomId || !date || !startTime || !endTime || !purpose) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  // Check conflicts
  const allBookings = await pool.query(
    `
    SELECT * FROM bookings
    WHERE room_id = $1 AND date = $2
    AND status NOT IN ('rejected','cancelled')
  `,
    [roomId, date],
  )

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  const isConflict = allBookings.rows.some((b) => {
    let bStart = toMinutes(b.start_time)
    let bEnd = toMinutes(b.end_time)
    let newStart = toMinutes(startTime)
    let newEnd = toMinutes(endTime)

    if (bEnd <= bStart) bEnd += 24 * 60
    if (newEnd <= newStart) newEnd += 24 * 60

    return newStart < bEnd && bStart < newEnd
  })

  if (isConflict) {
    return res.status(409).json({ error: "Time slot conflict" })
  }

  const id = "b" + Date.now()
  const today = new Date().toISOString().split("T")[0]

  try {
    await pool.query(
      `
      INSERT INTO bookings (id, room_id, user_id, date, start_time, end_time, purpose, attendees, status, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9)
    `,
      [
        id,
        roomId,
        req.user.id,
        date,
        startTime,
        endTime,
        purpose,
        attendees,
        today,
      ],
    )

    if (req.notifyClients) req.notifyClients()
    res
      .status(201)
      .json({
        id,
        roomId,
        userId: req.user.id,
        date,
        startTime,
        endTime,
        purpose,
        attendees,
        status: "pending",
        createdAt: today,
      })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// PATCH /api/bookings/:id — update status (admin approve/reject, user cancel)
router.patch("/:id", authMiddleware, async (req, res) => {
  const { status, rejectReason } = req.body
  try {
    const booking = await pool.query("SELECT * FROM bookings WHERE id = $1", [
      req.params.id,
    ])
    if (!booking.rows[0])
      return res.status(404).json({ error: "Booking not found" })

    const b = booking.rows[0]
    // User can only cancel their own bookings
    if (
      req.user.role !== "admin" &&
      (b.user_id !== req.user.id || status !== "cancelled")
    ) {
      return res.status(403).json({ error: "Forbidden" })
    }

    if (status === "rejected" && rejectReason) {
      await pool.query(
        "UPDATE bookings SET status = $1, reject_reason = $2 WHERE id = $3",
        [status, rejectReason, req.params.id],
      )
    } else {
      await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [
        status,
        req.params.id,
      ])
    }
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/bookings/:id — admin only
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" })
  try {
    await pool.query("DELETE FROM bookings WHERE id = $1", [req.params.id])
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/bookings — admin clears all booking history
router.delete("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" })
  try {
    await pool.query("DELETE FROM bookings")
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router

const router = require("express").Router()
const crypto = require("crypto")
const { pool } = require("../database")
const { authMiddleware } = require("../middleware/auth")

const MAX_ATTACHMENTS_PER_BOOKING = 5
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024 // 8 MB per file

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
])

const INLINE_PREVIEW_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
])

const EXT_TO_MIME = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

function getFileExtension(name) {
  const idx = String(name || "").lastIndexOf(".")
  return idx >= 0 ? String(name).slice(idx).toLowerCase() : ""
}

async function isUserApproved(userId, role) {
  if (role === "admin") return true
  if (!userId) return false
  const userRes = await pool.query("SELECT role, department FROM users WHERE id = $1", [userId])
  const row = userRes.rows[0]
  if (!row) return false
  if (row.role === "admin") return true
  const dept = row.department
  return Boolean(dept && dept.trim() !== "" && dept !== "-" && dept !== "รอการตรวจสอบ")
}

function sanitizeRelatedLinks(links) {
  if (!Array.isArray(links)) return []
  const cleaned = []
  for (const item of links.slice(0, 10)) {
    if (!item || typeof item !== "object") continue
    let url = String(item.url || "").trim()
    if (!url) continue
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue
      const title = String(item.title || "").trim().slice(0, 200) || parsed.hostname
      cleaned.push({ title, url: parsed.toString().slice(0, 1000) })
    } catch {
      // Skip invalid URLs
    }
  }
  return cleaned
}

function parseAndValidateAttachments(attachments, existingCount = 0) {
  if (!Array.isArray(attachments) || attachments.length === 0) return []
  if (existingCount + attachments.length > MAX_ATTACHMENTS_PER_BOOKING) {
    throw Object.assign(
      new Error(`สามารถแนบไฟล์เอกสารได้สูงสุด ${MAX_ATTACHMENTS_PER_BOOKING} ไฟล์ต่อการจอง`),
      { status: 400 },
    )
  }

  const parsed = []
  for (const item of attachments) {
    if (!item || typeof item !== "object") continue
    const rawName = String(item.name || "document").trim().replace(/[\\/\0\r\n]/g, "_").slice(0, 180)
    const ext = getFileExtension(rawName)
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw Object.assign(
        new Error(`ไม่รองรับประเภทไฟล์ "${rawName}" (รองรับ PDF, Word, Excel, PowerPoint, TXT, CSV และรูปภาพ JPG/PNG/WEBP)`),
        { status: 400 },
      )
    }

    let base64Str = String(item.data || "").trim()
    const commaIdx = base64Str.indexOf(",")
    if (base64Str.startsWith("data:") && commaIdx !== -1) {
      base64Str = base64Str.slice(commaIdx + 1)
    }
    if (!base64Str) {
      throw Object.assign(new Error(`ข้อมูลไฟล์ "${rawName}" ไม่ถูกต้อง`), { status: 400 })
    }

    const buffer = Buffer.from(base64Str, "base64")
    if (buffer.length === 0 || buffer.length > MAX_ATTACHMENT_BYTES) {
      throw Object.assign(
        new Error(`ไฟล์ "${rawName}" มีขนาดเกินกำหนด (สูงสุด 8 MB ต่อไฟล์)`),
        { status: 400 },
      )
    }

    const safeMime = EXT_TO_MIME[ext] || "application/octet-stream"
    parsed.push({
      id: "att_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex"),
      fileName: rawName,
      mimeType: safeMime,
      fileSize: buffer.length,
      fileData: buffer,
    })
  }
  return parsed
}

async function loadAttachmentsMap(bookingIds) {
  const map = new Map()
  if (!bookingIds.length) return map
  const attRes = await pool.query(
    `SELECT id, booking_id, file_name, mime_type, file_size, created_at
     FROM booking_attachments
     WHERE booking_id = ANY($1::text[])
     ORDER BY created_at ASC`,
    [bookingIds],
  )
  for (const row of attRes.rows) {
    if (!map.has(row.booking_id)) map.set(row.booking_id, [])
    map.get(row.booking_id).push({
      id: row.id,
      name: row.file_name,
      mimeType: row.mime_type,
      size: row.file_size,
      createdAt: row.created_at,
    })
  }
  return map
}

function serializeBooking(b, attachmentsMap, canViewProtectedResources) {
  const rawLinks =
    typeof b.related_links === "string"
      ? JSON.parse(b.related_links)
      : b.related_links || []
  const relatedLinks = canViewProtectedResources
    ? rawLinks
    : rawLinks.map((l) => ({ title: l.title || "ลิงก์เอกสาร", url: "" }))

  return {
    id: b.id,
    roomId: b.room_id,
    userId: b.user_id,
    userName: b.user_name || null,
    userDepartment: b.user_department || null,
    userRole: b.user_role || null,
    date: b.date,
    startTime: b.start_time,
    endTime: b.end_time,
    purpose: b.purpose,
    attendees: b.attendees,
    status: b.status,
    rejectReason: b.reject_reason || null,
    chairman: b.chairman || null,
    onlineMeeting: b.online_meeting || null,
    contactPerson: b.contact_person || null,
    relatedLinks,
    attachments: attachmentsMap.get(b.id) || [],
    createdAt: b.created_at,
  }
}

// GET /api/bookings/public — approved bookings only, no auth required
// Note: Protected attachment binaries & link URLs are masked for unauthenticated visitors
router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name AS user_name, u.department AS user_department, u.role AS user_role
       FROM bookings b
       LEFT JOIN users u ON u.id = b.user_id
       WHERE b.status = 'approved'
       ORDER BY b.date DESC, b.start_time`,
    )
    const attMap = await loadAttachmentsMap(result.rows.map((r) => r.id))
    res.json(result.rows.map((b) => serializeBooking(b, attMap, false)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// GET /api/bookings — returns own bookings (user) or all (admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const approved = await isUserApproved(req.user.id, req.user.role)
    let result
    if (req.user.role === "admin") {
      result = await pool.query(
        `SELECT b.*, u.name AS user_name, u.department AS user_department, u.role AS user_role
         FROM bookings b
         LEFT JOIN users u ON u.id = b.user_id
         ORDER BY b.date DESC, b.start_time`,
      )
    } else {
      result = await pool.query(
        `SELECT b.*, u.name AS user_name, u.department AS user_department, u.role AS user_role
         FROM bookings b
         LEFT JOIN users u ON u.id = b.user_id
         WHERE b.user_id = $1
            OR b.status = 'approved'
         ORDER BY b.date DESC, b.start_time`,
        [req.user.id],
      )
    }
    const attMap = await loadAttachmentsMap(result.rows.map((r) => r.id))
    res.json(result.rows.map((b) => serializeBooking(b, attMap, approved)))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// GET /api/bookings/:id/attachments/:attId — download or view attached document
// STRICT ACCESS CONTROL: Only Admin or Admin-approved users can view/download files!
router.get("/:id/attachments/:attId", authMiddleware, async (req, res) => {
  try {
    const approved = await isUserApproved(req.user.id, req.user.role)
    if (!approved) {
      return res.status(403).json({
        error:
          "เฉพาะผู้ใช้งานที่ได้รับการอนุมัติจากผู้ดูแลระบบแล้วเท่านั้น จึงจะสามารถเปิดดูหรือดาวน์โหลดเอกสารได้",
      })
    }

    const attRes = await pool.query(
      `SELECT a.*, b.status AS booking_status, b.user_id AS booking_user_id
       FROM booking_attachments a
       JOIN bookings b ON b.id = a.booking_id
       WHERE a.id = $1 AND a.booking_id = $2`,
      [req.params.attId, req.params.id],
    )
    const att = attRes.rows[0]
    if (!att) {
      return res.status(404).json({ error: "ไม่พบไฟล์เอกสารที่ระบุ" })
    }

    // If booking isn't approved yet, only admin or booking owner may access its file
    const isAdmin = req.user.role === "admin"
    const isOwner = att.booking_user_id === req.user.id
    if (att.booking_status !== "approved" && !isAdmin && !isOwner) {
      return res.status(403).json({
        error: "ไม่มีสิทธิ์เข้าถึงเอกสารของการจองที่ยังไม่ได้รับการอนุมัติ",
      })
    }

    const mode = req.query.mode === "view" ? "view" : "download"
    const canInline = mode === "view" && INLINE_PREVIEW_MIMES.has(att.mime_type)
    const disposition = canInline ? "inline" : "attachment"
    const encodedName = encodeURIComponent(att.file_name)

    res.setHeader("Content-Type", att.mime_type)
    res.setHeader("Content-Length", att.file_data.length)
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("Cache-Control", "private, no-store")
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="document${getFileExtension(att.file_name)}"; filename*=UTF-8''${encodedName}`,
    )
    res.send(att.file_data)
  } catch (err) {
    console.error("[ATTACHMENT GET ERROR]", err)
    res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/bookings/:id/attachments/:attId — remove an attachment (admin or owner while pending)
router.delete("/:id/attachments/:attId", authMiddleware, async (req, res) => {
  try {
    const bRes = await pool.query("SELECT user_id, status FROM bookings WHERE id = $1", [
      req.params.id,
    ])
    const booking = bRes.rows[0]
    if (!booking) return res.status(404).json({ error: "Booking not found" })

    const isAdmin = req.user.role === "admin"
    const isOwnerPending = booking.user_id === req.user.id && booking.status === "pending"
    if (!isAdmin && !isOwnerPending) {
      return res.status(403).json({ error: "Forbidden" })
    }

    await pool.query(
      "DELETE FROM booking_attachments WHERE id = $1 AND booking_id = $2",
      [req.params.attId, req.params.id],
    )
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// POST /api/bookings — create booking (with optional relatedLinks & document attachments)
router.post("/", authMiddleware, async (req, res) => {
  const {
    roomId,
    date,
    startTime,
    endTime,
    purpose,
    attendees,
    chairman,
    onlineMeeting,
    contactPerson,
    relatedLinks,
    attachments,
  } = req.body

  if (!roomId || !date || !startTime || !endTime || !purpose) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  let validatedAttachments = []
  try {
    validatedAttachments = parseAndValidateAttachments(attachments, 0)
  } catch (valErr) {
    return res.status(valErr.status || 400).json({ error: valErr.message })
  }
  const cleanLinks = sanitizeRelatedLinks(relatedLinks)

  const client = await pool.connect()
  try {
    // 1. Check user approval status (non-admins cannot book if pending approval)
    const approved = await isUserApproved(req.user.id, req.user.role)
    if (!approved) {
      return res.status(403).json({
        error:
          "บัญชีของคุณยังอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบก่อนทำการจองห้องประชุม",
      })
    }

    // 2. Check room existence & availability
    const roomRes = await client.query("SELECT status FROM rooms WHERE id = $1", [roomId])
    if (!roomRes.rows[0]) {
      return res.status(404).json({ error: "ไม่พบห้องประชุมที่ระบุ" })
    }
    if (roomRes.rows[0].status !== "available" && req.user.role !== "admin") {
      return res.status(400).json({ error: "ห้องประชุมนี้ปิดปรับปรุงหรือไม่พร้อมใช้งาน" })
    }

    // 3. Check conflicts
    const allBookings = await client.query(
      `SELECT * FROM bookings WHERE room_id = $1 AND date = $2 AND status = 'approved'`,
      [roomId, date],
    )

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
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    await client.query("BEGIN")

    await client.query(
      `INSERT INTO bookings (id, room_id, user_id, date, start_time, end_time, purpose, attendees, status, created_at, chairman, online_meeting, contact_person, related_links)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10,$11,$12,$13::jsonb)`,
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
        chairman || null,
        onlineMeeting || null,
        contactPerson || null,
        JSON.stringify(cleanLinks),
      ],
    )

    const savedAttachmentsMeta = []
    for (const att of validatedAttachments) {
      await client.query(
        `INSERT INTO booking_attachments (id, booking_id, file_name, mime_type, file_size, file_data, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [att.id, id, att.fileName, att.mimeType, att.fileSize, att.fileData, req.user.id],
      )
      savedAttachmentsMeta.push({
        id: att.id,
        name: att.fileName,
        mimeType: att.mimeType,
        size: att.fileSize,
        createdAt: new Date().toISOString(),
      })
    }

    await client.query("COMMIT")

    if (req.notifyClients) req.notifyClients()
    res.status(201).json({
      id,
      roomId,
      userId: req.user.id,
      userName: req.user.name || null,
      userDepartment: req.user.department || null,
      userRole: req.user.role || "user",
      date,
      startTime,
      endTime,
      purpose,
      attendees,
      status: "pending",
      chairman: chairman || null,
      onlineMeeting: onlineMeeting || null,
      contactPerson: contactPerson || null,
      relatedLinks: cleanLinks,
      attachments: savedAttachmentsMeta,
      createdAt: today,
    })
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {})
    console.error(err)
    res.status(500).json({ error: "Server error" })
  } finally {
    client.release()
  }
})

// PUT /api/bookings/:id — update booking details, related links & attachments (admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" })

  const {
    purpose,
    attendees,
    chairman,
    onlineMeeting,
    contactPerson,
    relatedLinks,
    date,
    startTime,
    endTime,
    newAttachments,
    removeAttachmentIds,
  } = req.body

  const client = await pool.connect()
  try {
    const booking = await client.query("SELECT * FROM bookings WHERE id = $1", [req.params.id])
    if (!booking.rows[0]) return res.status(404).json({ error: "Booking not found" })

    const cleanLinks = relatedLinks ? sanitizeRelatedLinks(relatedLinks) : null
    const toRemove = Array.isArray(removeAttachmentIds) ? removeAttachmentIds.filter((x) => typeof x === "string") : []

    const existingCountRes = await client.query(
      "SELECT COUNT(*)::int AS cnt FROM booking_attachments WHERE booking_id = $1 AND NOT (id = ANY($2::text[]))",
      [req.params.id, toRemove],
    )
    const remainingCount = existingCountRes.rows[0]?.cnt || 0

    let parsedNewAttachments = []
    try {
      parsedNewAttachments = parseAndValidateAttachments(newAttachments, remainingCount)
    } catch (valErr) {
      return res.status(valErr.status || 400).json({ error: valErr.message })
    }

    await client.query("BEGIN")

    await client.query(
      `UPDATE bookings SET
        purpose = COALESCE($1, purpose),
        attendees = COALESCE($2, attendees),
        chairman = $3,
        online_meeting = $4,
        contact_person = $5,
        related_links = COALESCE($6::jsonb, related_links),
        date = COALESCE($7, date),
        start_time = COALESCE($8, start_time),
        end_time = COALESCE($9, end_time)
      WHERE id = $10`,
      [
        purpose,
        attendees,
        chairman || null,
        onlineMeeting || null,
        contactPerson || null,
        cleanLinks !== null ? JSON.stringify(cleanLinks) : null,
        date,
        startTime,
        endTime,
        req.params.id,
      ],
    )

    if (toRemove.length > 0) {
      await client.query(
        "DELETE FROM booking_attachments WHERE booking_id = $1 AND id = ANY($2::text[])",
        [req.params.id, toRemove],
      )
    }

    for (const att of parsedNewAttachments) {
      await client.query(
        `INSERT INTO booking_attachments (id, booking_id, file_name, mime_type, file_size, file_data, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [att.id, req.params.id, att.fileName, att.mimeType, att.fileSize, att.fileData, req.user.id],
      )
    }

    await client.query("COMMIT")

    const attMap = await loadAttachmentsMap([req.params.id])
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true, attachments: attMap.get(req.params.id) || [] })
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {})
    console.error(err)
    res.status(500).json({ error: "Server error" })
  } finally {
    client.release()
  }
})

// PATCH /api/bookings/:id — update status (admin approve/reject, user cancel)
router.patch("/:id", authMiddleware, async (req, res) => {
  const { status, rejectReason } = req.body
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const booking = await client.query("SELECT * FROM bookings WHERE id = $1 FOR UPDATE", [
      req.params.id,
    ])
    if (!booking.rows[0]) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Booking not found" })
    }

    const b = booking.rows[0]
    // User can only cancel their own bookings
    if (
      req.user.role !== "admin" &&
      (b.user_id !== req.user.id || status !== "cancelled")
    ) {
      await client.query("ROLLBACK")
      return res.status(403).json({ error: "Forbidden" })
    }

    // Update the target booking status
    if (status === "rejected" && rejectReason) {
      await client.query(
        "UPDATE bookings SET status = $1, reject_reason = $2 WHERE id = $3",
        [status, rejectReason, req.params.id],
      )
    } else {
      await client.query("UPDATE bookings SET status = $1 WHERE id = $2", [
        status,
        req.params.id,
      ])
    }

    // Auto-reject ALL overlapping pending bookings when an approval is made
    if (status === "approved") {
      const autoRejectReason = "ระบบยกเลิกอัตโนมัติเนื่องจากมีผู้จองเวลาซ้อนทับได้รับการอนุมัติแล้ว"

      const autoRejectResult = await client.query(
        `UPDATE bookings
         SET status = 'rejected', reject_reason = $1
         WHERE room_id = $2
           AND date = $3
           AND status = 'pending'
           AND id != $4
           AND start_time::time < $5::time
           AND end_time::time   > $6::time
         RETURNING id`,
        [
          autoRejectReason,
          b.room_id,
          b.date,
          b.id,
          b.end_time,
          b.start_time,
        ],
      )

      if (autoRejectResult.rows.length > 0) {
        console.log(
          `[AUTO-REJECT] ✅ Rejected ${autoRejectResult.rows.length} conflicting bookings:`,
          autoRejectResult.rows.map((r) => r.id),
        )
      }
    }

    await client.query("COMMIT")
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error(err)
    res.status(500).json({ error: "Server error" })
  } finally {
    client.release()
  }
})

// DELETE /api/bookings/:id — admin can delete any; user can delete their own cancelled booking
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await pool.query("SELECT * FROM bookings WHERE id = $1", [req.params.id])
    if (!booking.rows[0]) return res.status(404).json({ error: "Booking not found" })

    const b = booking.rows[0]
    const isAdmin = req.user.role === "admin"
    const isOwner = b.user_id === req.user.id
    const isCancelled = b.status === "cancelled"

    if (!isAdmin && !(isOwner && isCancelled)) {
      return res.status(403).json({ error: "Forbidden" })
    }

    await pool.query("DELETE FROM bookings WHERE id = $1", [req.params.id])
    if (req.notifyClients) req.notifyClients()
    res.json({ success: true })
  } catch (err) {
    console.error(err)
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

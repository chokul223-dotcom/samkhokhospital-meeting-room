const { Pool } = require("pg")

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
})

async function initDB() {
  const client = await pool.connect()
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT DEFAULT '-',
        role TEXT NOT NULL CHECK(role IN ('admin','user')),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Rooms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        location TEXT NOT NULL,
        equipment TEXT[] DEFAULT '{}',
        status TEXT DEFAULT 'available' CHECK(status IN ('available','maintenance')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        room_id TEXT REFERENCES rooms(id),
        user_id TEXT REFERENCES users(id),
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        purpose TEXT NOT NULL,
        attendees INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled')),
        reject_reason TEXT DEFAULT NULL,
        created_at TEXT NOT NULL
      )
    `)

    // Add reject_reason column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reject_reason TEXT DEFAULT NULL
    `)

    // Add new booking details columns if they don't exist
    await client.query(`
      ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS chairman TEXT DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS online_meeting TEXT DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS contact_person TEXT DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS related_links JSONB DEFAULT '[]'::jsonb
    `)

    // Add image_url column to rooms if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL
    `)

    // Add email_verified column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
    `)

    // Add email column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT
    `)

    // Add member_id column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS member_id TEXT
    `)
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_member_id_unique ON users(member_id) WHERE member_id IS NOT NULL
      `)
    } catch {}


    // Add unique constraint on email if not exists (ignore error if already exists)
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email) WHERE email IS NOT NULL
      `)
    } catch {}

    // Backfill member_id for existing users
    const usersWithoutMemberId = await client.query(`SELECT id FROM users WHERE member_id IS NULL`)
    if (usersWithoutMemberId.rows.length > 0) {
      for (const row of usersWithoutMemberId.rows) {
        let memberId
        let isUnique = false
        while (!isUnique) {
          memberId = Math.floor(10000000 + Math.random() * 90000000).toString()
          const check = await client.query(`SELECT id FROM users WHERE member_id = $1`, [memberId])
          if (check.rows.length === 0) isUnique = true
        }
        await client.query(`UPDATE users SET member_id = $1 WHERE id = $2`, [memberId, row.id])
      }
    }

    // Password reset tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Email verification tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verify_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // 2FA OTP tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS two_factor_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // System satisfaction evaluations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        answers JSONB NOT NULL,
        suggestion TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Seed admin user if not exists
    const bcrypt = require("bcryptjs")
    const adminExists = await client.query(
      "SELECT id FROM users WHERE id = 'u1'",
    )
    if (adminExists.rows.length === 0) {
      const adminHash = await bcrypt.hash("Admin123456", 10)
      const userHash = await bcrypt.hash("Test123456", 10)
      await client.query(
        `
        INSERT INTO users (id, name, department, role, username, email, password) VALUES
        ('u1', 'ผู้ดูแลระบบ', 'IT', 'admin', 'Admin', 'admin@example.com', $1),
        ('u2', 'ทั่วไป', 'ทั่วไป', 'user', 'Test', 'test@example.com', $2)
      `,
        [adminHash, userHash],
      )
      await client.query(`
        INSERT INTO rooms (id, name, capacity, location, equipment, status, image_url) VALUES
        ('r1', 'ห้องประชุมใหญ่', 50, 'อาคาร A ชั้น 2', ARRAY['โปรเจคเตอร์','ไมโครโฟน','จอภาพ','ระบบเสียง'], 'available', '/rooms/room_large.jpg'),
        ('r2', 'ห้องประชุมเล็ก 1', 15, 'อาคาร A ชั้น 1', ARRAY['โปรเจคเตอร์','กระดานไวท์บอร์ด'], 'available', '/rooms/room_small.jpg')
      `)
      console.log("✅ Database seeded with initial data")
    } else {
      // For existing databases, ensure default users have their emails set
      await client.query("UPDATE users SET email = 'admin@example.com' WHERE username = 'Admin' AND email IS NULL")
      await client.query("UPDATE users SET email = 'test@example.com' WHERE username = 'Test' AND email IS NULL")
      console.log("✅ Existing default users emails updated")
    }

    console.log("✅ Database initialized")
  } finally {
    client.release()
  }
}

module.exports = { pool, initDB }

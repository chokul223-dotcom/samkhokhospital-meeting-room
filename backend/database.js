const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

    // Add email_verified column if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
    `)

    // Add email column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT
    `)

    // Add unique constraint on email if not exists (ignore error if already exists)
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email) WHERE email IS NOT NULL
      `)
    } catch {}

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


    // Seed admin user if not exists
    const bcrypt = require("bcryptjs")
    const adminExists = await client.query(
      "SELECT id FROM users WHERE username = 'Admin'",
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
        INSERT INTO rooms (id, name, capacity, location, equipment, status) VALUES
        ('r1', 'ห้องประชุมใหญ่', 50, 'อาคาร A ชั้น 2', ARRAY['โปรเจคเตอร์','ไมโครโฟน','จอภาพ','ระบบเสียง'], 'available'),
        ('r2', 'ห้องประชุมเล็ก 1', 15, 'อาคาร A ชั้น 1', ARRAY['โปรเจคเตอร์','กระดานไวท์บอร์ด'], 'available')
      `)
      console.log("✅ Database seeded with initial data")
    }

    console.log("✅ Database initialized")
  } finally {
    client.release()
  }
}

module.exports = { pool, initDB }

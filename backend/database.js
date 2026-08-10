const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
        created_at TEXT NOT NULL
      )
    `)

    // Seed admin user if not exists
    const bcrypt = require('bcryptjs')
    const adminExists = await client.query("SELECT id FROM users WHERE username = 'Admin'")
    if (adminExists.rows.length === 0) {
      const adminHash = await bcrypt.hash('Admin123456', 10)
      const userHash = await bcrypt.hash('Test123456', 10)
      await client.query(`
        INSERT INTO users (id, name, department, role, username, password) VALUES
        ('u1', 'ผู้ดูแลระบบ', 'IT', 'admin', 'Admin', $1),
        ('u2', 'ทั่วไป', 'ทั่วไป', 'user', 'Test', $2)
      `, [adminHash, userHash])

      await client.query(`
        INSERT INTO rooms (id, name, capacity, location, equipment, status) VALUES
        ('r1', 'ห้องประชุมใหญ่', 50, 'อาคาร A ชั้น 2', ARRAY['โปรเจคเตอร์','ไมโครโฟน','จอภาพ','ระบบเสียง'], 'available'),
        ('r2', 'ห้องประชุมเล็ก 1', 15, 'อาคาร A ชั้น 1', ARRAY['โปรเจคเตอร์','กระดานไวท์บอร์ด'], 'available'),
        ('r3', 'ห้องประชุมเล็ก 2', 20, 'อาคาร B ชั้น 3', ARRAY['โปรเจคเตอร์','กระดานไวท์บอร์ด','วิดีโอคอนเฟอเรนซ์'], 'available'),
        ('r4', 'ห้องอบรม', 80, 'อาคาร C ชั้น 1', ARRAY['โปรเจคเตอร์ x2','ไมโครโฟน','จอภาพ','ระบบเสียง','เวที'], 'available'),
        ('r5', 'ห้องประชุม VIP', 10, 'อาคาร A ชั้น 3', ARRAY['โทรทัศน์','วิดีโอคอนเฟอเรนซ์','กาแฟ/น้ำดื่ม'], 'maintenance')
      `)
      console.log('✅ Database seeded with initial data')
    }

    console.log('✅ Database initialized')
  } finally {
    client.release()
  }
}

module.exports = { pool, initDB }

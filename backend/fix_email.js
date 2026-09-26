require('dotenv').config()
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.query("UPDATE users SET email_verified = TRUE WHERE id = 'u1'")
  .then(r => {
    console.log('Updated rows:', r.rowCount)
    return pool.query("SELECT id, name, email, email_verified FROM users WHERE id = 'u1'")
  })
  .then(r => {
    console.log('User:', JSON.stringify(r.rows[0]))
    pool.end()
  })
  .catch(e => { console.error(e.message); pool.end() })

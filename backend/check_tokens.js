require('dotenv').config()
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

pool.query("SELECT token, user_id, used, expires_at, created_at FROM email_verify_tokens ORDER BY created_at DESC LIMIT 5")
  .then(r => {
    console.log('Email verify tokens:')
    r.rows.forEach(row => console.log(JSON.stringify(row)))
    pool.end()
  })
  .catch(e => { console.error(e.message); pool.end() })

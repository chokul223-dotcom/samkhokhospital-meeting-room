require("dotenv").config({ path: ".env" });
const { pool } = require("./backend/database");

async function run() {
  try {
    const res1 = await pool.query("UPDATE users SET email = 'admin@example.com' WHERE username = 'Admin'");
    const res2 = await pool.query("UPDATE users SET email = 'test@example.com' WHERE username = 'Test'");
    console.log("Updated Admin:", res1.rowCount);
    console.log("Updated Test:", res2.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();

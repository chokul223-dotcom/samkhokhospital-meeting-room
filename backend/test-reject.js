const { pool } = require('./database.js');
async function test() {
  const roomId = 'r1';
  const date = '2026-09-20';
  const startTime = '10:00';
  const endTime = '12:00';
  
  // Create 4 pending bookings
  for(let i=1; i<=4; i++) {
    await pool.query(
      `INSERT INTO bookings (id, room_id, user_id, date, start_time, end_time, purpose, attendees, status, created_at)
      VALUES ($1, $2, 'u2', $3, $4, $5, 'Test', 10, 'pending', '2026-09-17')`,
      ['test-b' + i, roomId, date, startTime, endTime]
    );
  }
  
  console.log('Bookings created.');
  
  // Approve test-b1 and run the auto-reject query
  const b = { id: 'test-b1', room_id: roomId, date, start_time: startTime, end_time: endTime };
  const autoRejectReason = 'auto reject test';
  
  const res = await pool.query(
    `UPDATE bookings
     SET status = 'rejected', reject_reason = $1
     WHERE room_id = $2
       AND date = $3
       AND status = 'pending'
       AND id != $4
       AND start_time::time < $5::time
       AND end_time::time   > $6::time
     RETURNING id`,
    [autoRejectReason, b.room_id, b.date, b.id, b.end_time, b.start_time]
  );
  
  console.log('Rejected:', res.rows);
  
  // Clean up
  await pool.query(`DELETE FROM bookings WHERE id LIKE 'test-b%'`);
  pool.end();
}
test().catch(console.error);

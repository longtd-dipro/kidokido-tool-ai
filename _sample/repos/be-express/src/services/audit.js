const { Pool } = require('pg');
const pool = new Pool();
exports.log = async (userId, action) => {
  await pool.query(`INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`, [userId, action]);
};

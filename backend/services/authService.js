const pool = require('../database/pool');

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createUser(username, email, passwordHash, role = 'user') {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, role]
  );
  return await findUserById(result.insertId);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};

const db = require('../connectionMySQL').promise()

async function createUser(username, email, passwordHash, role = 'user') {
  const validRoles = ['user', 'admin', 'organization']
  const userRole = validRoles.includes(role) ? role : 'user'
  const [result] = await db.execute(
    `INSERT INTO users (username, email, password_Hash, role)
        VALUES (?, ?, ?, ?)`,
    [username, email, passwordHash, userRole],
  )

  return result.insertId
}

async function findByEmail(email) {
  const [users] = await db.execute(
    `SELECT id, username, email, password_hash
        FROM users WHERE email = ?`,
    [email],
  )

  return users[0] || null
}

async function findById(id) {
  const [users] = await db.execute(
    'SELECT id, username, email, role, is_public_prospect FROM users WHERE id = ?',
    [id],
  )

  return users[0] || null
}

async function updateUserPrivacy(id, isPublicProspect) {
  await db.execute('UPDATE users SET is_public_prospect = ? WHERE id = ?', [
    isPublicProspect ? 1 : 0,
    id,
  ])
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateUserPrivacy,
}

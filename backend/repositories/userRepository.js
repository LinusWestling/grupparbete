const pool = require('../database/pool')

async function createUser(username, email, passwordHash, role = 'user', orgRequestStatus = 'none') {
  const validRoles = ['user', 'admin', 'organization']
  const userRole = validRoles.includes(role) ? role : 'user'
  const validStatuses = ['none', 'pending', 'approved', 'rejected']
  const reqStatus = validStatuses.includes(orgRequestStatus) ? orgRequestStatus : 'none'

  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, role, org_request_status)
        VALUES (?, ?, ?, ?, ?)`,
    [username, email, passwordHash, userRole, reqStatus],
  )

  return result.insertId
}

async function findByEmail(email) {
  const [users] = await pool.execute(
    `SELECT id, username, email, password_hash, role, org_request_status
        FROM users WHERE email = ?`,
    [email],
  )

  return users[0] || null
}

async function findById(id) {
  const [users] = await pool.execute(
    'SELECT id, username, email, role, is_public_prospect, org_request_status FROM users WHERE id = ?',
    [id],
  )

  return users[0] || null
}

async function updateUserPrivacy(id, isPublicProspect) {
  await pool.execute('UPDATE users SET is_public_prospect = ? WHERE id = ?', [
    isPublicProspect ? 1 : 0,
    id,
  ])
}

async function getOrganizationRequests() {
  const [rows] = await pool.query(
    `SELECT id, username, email, role, org_request_status, created_at
     FROM users
     WHERE org_request_status != 'none' OR role = 'organization'
     ORDER BY FIELD(org_request_status, 'pending', 'approved', 'rejected', 'none'), created_at DESC`,
  )
  return rows
}

async function updateOrganizationRequestStatus(userId, action) {
  if (action === 'approve') {
    const [result] = await pool.execute(
      `UPDATE users
       SET role = 'organization', org_request_status = 'approved', is_public_prospect = 0
       WHERE id = ? AND role != 'admin'`,
      [userId],
    )
    return result.affectedRows > 0
  }

  if (action === 'reject') {
    const [result] = await pool.execute(
      `UPDATE users
       SET role = 'user', org_request_status = 'rejected'
       WHERE id = ? AND role != 'admin'`,
      [userId],
    )
    return result.affectedRows > 0
  }

  return false
}

async function getCandidateAccessRequests(candidateId) {
  const [rows] = await pool.execute(
    `SELECT par.id, par.organization_id, u.username AS organization_username,
            par.status, par.requested_at, par.responded_at
     FROM prospect_access_requests par
     JOIN users u ON u.id = par.organization_id
     WHERE par.candidate_id = ?
     ORDER BY FIELD(par.status, 'pending', 'approved', 'rejected'), par.requested_at DESC`,
    [candidateId],
  )
  return rows
}

async function updateCandidateAccessRequest(requestId, candidateId, status) {
  const [result] = await pool.execute(
    `UPDATE prospect_access_requests
     SET status = ?, responded_at = CURRENT_TIMESTAMP
     WHERE id = ? AND candidate_id = ?`,
    [status, requestId, candidateId],
  )
  return result.affectedRows > 0
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateUserPrivacy,
  getOrganizationRequests,
  updateOrganizationRequestStatus,
  getCandidateAccessRequests,
  updateCandidateAccessRequest,
}

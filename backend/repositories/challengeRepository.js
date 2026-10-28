const pool = require('../database/pool')

/**
 * Create a new challenge between two users
 */
async function createChallenge(challengerUserId, challengedUserId, topicId, difficulty) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  const [result] = await pool.execute(
    `INSERT INTO challenges
      (challenger_user_id, challenged_user_id, topic_id, difficulty, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [challengerUserId, challengedUserId, topicId, difficulty, expiresAt],
  )

  return result.insertId
}

/**
 * Get challenge by ID with user and topic information
 */
async function getChallengeById(challengeId) {
  const [rows] = await pool.execute(
    `SELECT
      c.*,
      challenger.username AS challenger_username,
      challenged.username AS challenged_username,
      t.name AS topic_name
     FROM challenges c
     JOIN users challenger ON c.challenger_user_id = challenger.id
     JOIN users challenged ON c.challenged_user_id = challenged.id
     JOIN topics t ON c.topic_id = t.id
     WHERE c.id = ?`,
    [challengeId],
  )

  return rows.length > 0 ? rows[0] : null
}

/**
 * Get all pending challenges for a user (incoming invitations)
 */
async function getPendingChallengesForUser(userId) {
  const [rows] = await pool.execute(
    `SELECT
      c.id,
      c.topic_id,
      c.difficulty,
      c.created_at,
      c.expires_at,
      challenger.id AS challenger_id,
      challenger.username AS challenger_username,
      t.name AS topic_name
     FROM challenges c
     JOIN users challenger ON c.challenger_user_id = challenger.id
     JOIN topics t ON c.topic_id = t.id
     WHERE c.challenged_user_id = ?
       AND c.status = 'pending'
       AND (c.expires_at IS NULL OR c.expires_at > NOW())
     ORDER BY c.created_at DESC`,
    [userId],
  )

  return rows
}

/**
 * Get all active challenges for a user (quizzes in progress)
 */
async function getActiveChallengesForUser(userId) {
  const [rows] = await pool.execute(
    `SELECT
      c.*,
      challenger.username AS challenger_username,
      challenged.username AS challenged_username,
      t.name AS topic_name,
      challenger_quiz.status AS challenger_quiz_status,
      challenged_quiz.status AS challenged_quiz_status
     FROM challenges c
     JOIN users challenger ON c.challenger_user_id = challenger.id
     JOIN users challenged ON c.challenged_user_id = challenged.id
     JOIN topics t ON c.topic_id = t.id
     LEFT JOIN quizzes challenger_quiz ON c.challenger_quiz_id = challenger_quiz.id
     LEFT JOIN quizzes challenged_quiz ON c.challenged_quiz_id = challenged_quiz.id
     WHERE (c.challenger_user_id = ? OR c.challenged_user_id = ?)
       AND c.status IN ('accepted', 'active')
     ORDER BY c.created_at DESC`,
    [userId, userId],
  )

  return rows
}

/**
 * Get challenge history for a user (completed challenges)
 */
async function getChallengeHistoryForUser(userId) {
  const [rows] = await pool.execute(
    `SELECT
      c.*,
      challenger.username AS challenger_username,
      challenged.username AS challenged_username,
      t.name AS topic_name,
      winner.username AS winner_username
     FROM challenges c
     JOIN users challenger ON c.challenger_user_id = challenger.id
     JOIN users challenged ON c.challenged_user_id = challenged.id
     JOIN topics t ON c.topic_id = t.id
     LEFT JOIN users winner ON c.winner_user_id = winner.id
     WHERE (c.challenger_user_id = ? OR c.challenged_user_id = ?)
       AND c.status = 'completed'
     ORDER BY c.completed_at DESC
     LIMIT 50`,
    [userId, userId],
  )

  return rows
}

/**
 * Update challenge status
 */
async function updateChallengeStatus(challengeId, status, additionalFields = {}) {
  const fields = { status, ...additionalFields }
  const setClause = Object.keys(fields)
    .map((key) => `${key} = ?`)
    .join(', ')
  const values = [...Object.values(fields), challengeId]

  await pool.execute(`UPDATE challenges SET ${setClause} WHERE id = ?`, values)
}

/**
 * Accept a challenge
 */
async function acceptChallenge(challengeId) {
  await pool.execute(
    `UPDATE challenges
     SET status = 'accepted', accepted_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [challengeId],
  )
}

/**
 * Decline a challenge
 */
async function declineChallenge(challengeId) {
  await pool.execute(
    `UPDATE challenges
     SET status = 'declined'
     WHERE id = ? AND status = 'pending'`,
    [challengeId],
  )
}

/**
 * Link a quiz to a challenge (when user starts their quiz)
 */
async function linkQuizToChallenge(challengeId, userId, quizId) {
  // Determine which quiz field to update based on user role
  const challenge = await getChallengeById(challengeId)
  if (!challenge) return false

  const isChallenger = challenge.challenger_user_id === userId

  await pool.execute(
    `UPDATE challenges
     SET ${isChallenger ? 'challenger_quiz_id' : 'challenged_quiz_id'} = ?,
         status = CASE
           WHEN status = 'accepted' AND ${isChallenger ? 'challenged_quiz_id' : 'challenger_quiz_id'} IS NOT NULL
           THEN 'active'
           WHEN status = 'accepted'
           THEN 'accepted'
           ELSE status
         END,
         started_at = CASE
           WHEN status = 'accepted' AND ${isChallenger ? 'challenged_quiz_id' : 'challenger_quiz_id'} IS NOT NULL
           THEN NOW()
           ELSE started_at
         END
     WHERE id = ?`,
    [quizId, challengeId],
  )

  return true
}

/**
 * Get challenge progress/status for live updates
 */
async function getChallengeProgress(challengeId) {
  const [rows] = await pool.execute(
    `SELECT
      c.id,
      c.status,
      c.challenger_user_id,
      c.challenged_user_id,
      c.challenger_quiz_id,
      c.challenged_quiz_id,
      challenger_quiz.total_cnt AS challenger_total,
      challenged_quiz.total_cnt AS challenged_total,
      challenger_quiz.status AS challenger_quiz_status,
      challenged_quiz.status AS challenged_quiz_status,
      (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = c.challenger_quiz_id AND is_answered = 1) AS challenger_answered,
      (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = c.challenged_quiz_id AND is_answered = 1) AS challenged_answered
     FROM challenges c
     LEFT JOIN quizzes challenger_quiz ON c.challenger_quiz_id = challenger_quiz.id
     LEFT JOIN quizzes challenged_quiz ON c.challenged_quiz_id = challenged_quiz.id
     WHERE c.id = ?`,
    [challengeId],
  )

  return rows.length > 0 ? rows[0] : null
}

/**
 * Mark challenge as completed and determine winner
 */
async function completeChallenge(challengeId, winnerUserId) {
  await pool.execute(
    `UPDATE challenges
     SET status = 'completed',
         completed_at = NOW(),
         winner_user_id = ?
     WHERE id = ?`,
    [winnerUserId, challengeId],
  )
}

/**
 * Expire old pending challenges (called by cron or on-demand)
 */
async function expireOldChallenges() {
  const [result] = await pool.execute(
    `UPDATE challenges
     SET status = 'expired'
     WHERE status = 'pending'
       AND expires_at IS NOT NULL
       AND expires_at < NOW()`,
  )

  return result.affectedRows
}

module.exports = {
  createChallenge,
  getChallengeById,
  getPendingChallengesForUser,
  getActiveChallengesForUser,
  getChallengeHistoryForUser,
  updateChallengeStatus,
  acceptChallenge,
  declineChallenge,
  linkQuizToChallenge,
  getChallengeProgress,
  completeChallenge,
  expireOldChallenges,
}

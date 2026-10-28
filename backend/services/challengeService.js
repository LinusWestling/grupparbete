const challengeRepository = require('../repositories/challengeRepository')
const pool = require('../database/pool')

/**
 * Create a new challenge
 */
async function createChallenge(challengerUserId, challengedUserId, topicId, difficulty) {
  // Validation
  if (challengerUserId === challengedUserId) {
    throw Object.assign(new Error('You cannot challenge yourself'), { status: 400 })
  }

  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw Object.assign(new Error('Difficulty must be between 1 and 5'), { status: 400 })
  }

  // Check if challenged user exists
  const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [challengedUserId])
  if (users.length === 0) {
    throw Object.assign(new Error('Challenged user not found'), { status: 404 })
  }

  // Check if topic exists
  const [topics] = await pool.query('SELECT id FROM topics WHERE id = ?', [topicId])
  if (topics.length === 0) {
    throw Object.assign(new Error('Topic not found'), { status: 404 })
  }

  // Check for existing pending challenge between same users for same topic
  const [existing] = await pool.query(
    `SELECT id FROM challenges
     WHERE ((challenger_user_id = ? AND challenged_user_id = ?)
        OR (challenger_user_id = ? AND challenged_user_id = ?))
       AND topic_id = ?
       AND status IN ('pending', 'accepted', 'active')`,
    [challengerUserId, challengedUserId, challengedUserId, challengerUserId, topicId],
  )

  if (existing.length > 0) {
    throw Object.assign(
      new Error('A challenge already exists between you and this user for this topic'),
      { status: 409 },
    )
  }

  const challengeId = await challengeRepository.createChallenge(
    challengerUserId,
    challengedUserId,
    topicId,
    difficulty,
  )

  return challengeRepository.getChallengeById(challengeId)
}

/**
 * Get pending challenges for a user (incoming invitations)
 */
async function getPendingChallenges(userId) {
  return challengeRepository.getPendingChallengesForUser(userId)
}

/**
 * Get active challenges for a user
 */
async function getActiveChallenges(userId) {
  return challengeRepository.getActiveChallengesForUser(userId)
}

/**
 * Get challenge history for a user
 */
async function getChallengeHistory(userId) {
  return challengeRepository.getChallengeHistoryForUser(userId)
}

/**
 * Accept a challenge
 */
async function acceptChallenge(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw Object.assign(new Error('Challenge not found'), { status: 404 })
  }

  // Only the challenged user can accept
  if (challenge.challenged_user_id !== userId) {
    throw Object.assign(new Error('You are not authorized to accept this challenge'), {
      status: 403,
    })
  }

  if (challenge.status !== 'pending') {
    throw Object.assign(new Error('This challenge cannot be accepted'), { status: 409 })
  }

  // Check if expired
  if (challenge.expires_at && new Date(challenge.expires_at) < new Date()) {
    await challengeRepository.updateChallengeStatus(challengeId, 'expired')
    throw Object.assign(new Error('This challenge has expired'), { status: 410 })
  }

  await challengeRepository.acceptChallenge(challengeId)

  return challengeRepository.getChallengeById(challengeId)
}

/**
 * Decline a challenge
 */
async function declineChallenge(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw Object.assign(new Error('Challenge not found'), { status: 404 })
  }

  // Only the challenged user can decline
  if (challenge.challenged_user_id !== userId) {
    throw Object.assign(new Error('You are not authorized to decline this challenge'), {
      status: 403,
    })
  }

  if (challenge.status !== 'pending') {
    throw Object.assign(new Error('This challenge cannot be declined'), { status: 409 })
  }

  await challengeRepository.declineChallenge(challengeId)

  return { message: 'Challenge declined' }
}

/**
 * Start a challenge quiz for a user
 * This is called when a user clicks "Start Quiz" from an accepted challenge
 */
async function startChallengeQuiz(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw Object.assign(new Error('Challenge not found'), { status: 404 })
  }

  // User must be part of the challenge
  if (challenge.challenger_user_id !== userId && challenge.challenged_user_id !== userId) {
    throw Object.assign(new Error('You are not part of this challenge'), { status: 403 })
  }

  // Challenge must be accepted
  if (challenge.status !== 'accepted' && challenge.status !== 'active') {
    throw Object.assign(new Error('Challenge is not ready to start'), { status: 409 })
  }

  // Check if user already has a quiz for this challenge
  const isChallenger = challenge.challenger_user_id === userId
  const existingQuizId = isChallenger ? challenge.challenger_quiz_id : challenge.challenged_quiz_id

  if (existingQuizId) {
    // Return existing quiz details
    const quizService = require('./quiz/quizService')
    return quizService.getQuizDetails(existingQuizId, userId)
  }

  // Create a new quiz using the challenge's topic and difficulty
  // Use challenge.id as seed for deterministic question order
  const quizService = require('./quiz/quizService')
  const quiz = await quizService.startQuiz(
    userId,
    challenge.topic_id,
    challenge.difficulty,
    10,
    challenge.id, // Pass challenge ID as seed
  )

  // Link the quiz to the challenge
  await challengeRepository.linkQuizToChallenge(challengeId, userId, quiz.quiz_id)

  return quiz
}

/**
 * Get challenge progress (for polling)
 */
async function getChallengeProgress(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw Object.assign(new Error('Challenge not found'), { status: 404 })
  }

  // User must be part of the challenge
  if (challenge.challenger_user_id !== userId && challenge.challenged_user_id !== userId) {
    throw Object.assign(new Error('You are not part of this challenge'), { status: 403 })
  }

  const progress = await challengeRepository.getChallengeProgress(challengeId)

  if (!progress) {
    throw Object.assign(new Error('Challenge progress not found'), { status: 404 })
  }

  const isChallenger = challenge.challenger_user_id === userId

  return {
    challenge_id: challengeId,
    status: progress.status,
    your_progress: {
      answered_count: isChallenger ? progress.challenger_answered || 0 : progress.challenged_answered || 0,
      total_count: isChallenger ? progress.challenger_total || 10 : progress.challenged_total || 10,
      is_completed: isChallenger
        ? progress.challenger_quiz_status === 'completed'
        : progress.challenged_quiz_status === 'completed',
    },
    opponent_progress: {
      answered_count: isChallenger ? progress.challenged_answered || 0 : progress.challenger_answered || 0,
      total_count: isChallenger ? progress.challenged_total || 10 : progress.challenger_total || 10,
      is_completed: isChallenger
        ? progress.challenged_quiz_status === 'completed'
        : progress.challenger_quiz_status === 'completed',
    },
  }
}

/**
 * Get challenge result (when both users have completed)
 */
async function getChallengeResult(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw Object.assign(new Error('Challenge not found'), { status: 404 })
  }

  // User must be part of the challenge
  if (challenge.challenger_user_id !== userId && challenge.challenged_user_id !== userId) {
    throw Object.assign(new Error('You are not part of this challenge'), { status: 403 })
  }

  // Check if both quizzes are completed
  const [quizzes] = await pool.query(
    `SELECT
      q.id,
      q.user_id,
      q.total_score,
      q.correct_cnt,
      q.total_cnt,
      q.status,
      q.created_at,
      q.completed_at,
      TIMESTAMPDIFF(SECOND, q.created_at, q.completed_at) AS time_taken_seconds
     FROM quizzes q
     WHERE q.id IN (?, ?)`,
    [challenge.challenger_quiz_id, challenge.challenged_quiz_id],
  )

  const challengerQuiz = quizzes.find((q) => q.user_id === challenge.challenger_user_id)
  const challengedQuiz = quizzes.find((q) => q.user_id === challenge.challenged_user_id)

  // If both are completed and challenge is not yet marked as completed, determine winner
  if (
    challengerQuiz?.status === 'completed' &&
    challengedQuiz?.status === 'completed' &&
    challenge.status !== 'completed'
  ) {
    await determineWinnerAndComplete(challengeId, challengerQuiz, challengedQuiz)
    // Re-fetch challenge with updated winner
    return getChallengeResult(challengeId, userId)
  }

  return {
    challenge_id: challengeId,
    status: challenge.status,
    challenger: challengerQuiz
      ? {
          user_id: challenge.challenger_user_id,
          username: challenge.challenger_username,
          score: challengerQuiz.total_score,
          correct_answers: challengerQuiz.correct_cnt,
          total_questions: challengerQuiz.total_cnt,
          time_taken_seconds: challengerQuiz.time_taken_seconds,
          is_completed: challengerQuiz.status === 'completed',
        }
      : null,
    challenged: challengedQuiz
      ? {
          user_id: challenge.challenged_user_id,
          username: challenge.challenged_username,
          score: challengedQuiz.total_score,
          correct_answers: challengedQuiz.correct_cnt,
          total_questions: challengedQuiz.total_cnt,
          time_taken_seconds: challengedQuiz.time_taken_seconds,
          is_completed: challengedQuiz.status === 'completed',
        }
      : null,
    winner_id: challenge.winner_user_id,
    winner_username: challenge.winner_user_id
      ? challenge.winner_user_id === challenge.challenger_user_id
        ? challenge.challenger_username
        : challenge.challenged_username
      : null,
  }
}

/**
 * Determine winner based on score and time, then mark challenge as completed
 */
async function determineWinnerAndComplete(challengeId, challengerQuiz, challengedQuiz) {
  let winnerId = null

  // Winner = highest score, or if tied, fastest time
  if (challengerQuiz.total_score > challengedQuiz.total_score) {
    winnerId = challengerQuiz.user_id
  } else if (challengedQuiz.total_score > challengerQuiz.total_score) {
    winnerId = challengedQuiz.user_id
  } else {
    // Tie on score, check time
    if (
      challengerQuiz.time_taken_seconds !== null &&
      challengedQuiz.time_taken_seconds !== null
    ) {
      winnerId =
        challengerQuiz.time_taken_seconds < challengedQuiz.time_taken_seconds
          ? challengerQuiz.user_id
          : challengedQuiz.user_id
    }
    // If time is equal or null, winnerId stays null (tie)
  }

  await challengeRepository.completeChallenge(challengeId, winnerId)
}

/**
 * Search users by username (for finding opponents)
 */
async function searchUsers(query, excludeUserId) {
  if (!query || query.length < 2) {
    throw Object.assign(new Error('Search query must be at least 2 characters'), { status: 400 })
  }

  const [users] = await pool.query(
    `SELECT id, username, email
     FROM users
     WHERE username LIKE ?
       AND id != ?
     LIMIT 20`,
    [`%${query}%`, excludeUserId],
  )

  return users
}

module.exports = {
  createChallenge,
  getPendingChallenges,
  getActiveChallenges,
  getChallengeHistory,
  acceptChallenge,
  declineChallenge,
  startChallengeQuiz,
  getChallengeProgress,
  getChallengeResult,
  searchUsers,
}

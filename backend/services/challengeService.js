const challengeRepository = require('../repositories/challengeRepository')
const pool = require('../database/pool')
const quizService = require('./quiz/quizService')

// Helper: Create error with status code
function createError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

// Helper: Validate user is part of challenge
function validateUserInChallenge(challenge, userId) {
  if (challenge.challenger_user_id !== userId && challenge.challenged_user_id !== userId) {
    throw createError('You are not part of this challenge', 403)
  }
}

/**
 * Create a new challenge and start the challenger's quiz immediately
 */
async function createChallenge(challengerUserId, challengedUserId, topicId, difficulty) {
  // Validation
  if (challengerUserId === challengedUserId) {
    throw createError('You cannot challenge yourself', 400)
  }

  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw createError('Difficulty must be between 1 and 5', 400)
  }

  // Use a connection from the pool for the transaction
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Check if challenged user exists
    const [users] = await connection.query('SELECT id FROM users WHERE id = ?', [challengedUserId])
    if (users.length === 0) {
      throw createError('Challenged user not found', 404)
    }

    // Check if topic exists
    const [topics] = await connection.query('SELECT id FROM topics WHERE id = ?', [topicId])
    if (topics.length === 0) {
      throw createError('Topic not found', 404)
    }

    // Check for existing pending challenge between same users for same topic
    // This check is now part of the transaction and uses SELECT ... FOR UPDATE to prevent race conditions
    const [existing] = await connection.query(
      `SELECT id FROM challenges
       WHERE ((challenger_user_id = ? AND challenged_user_id = ?)
          OR (challenger_user_id = ? AND challenged_user_id = ?))
         AND topic_id = ?
         AND status IN ('pending', 'accepted', 'active')
       FOR UPDATE`,
      [challengerUserId, challengedUserId, challengedUserId, challengerUserId, topicId],
    )

    if (existing.length > 0) {
      throw createError('A challenge already exists between you and this user for this topic', 409)
    }

    // Create the challenge
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    const [challengeResult] = await connection.execute(
      `INSERT INTO challenges
        (challenger_user_id, challenged_user_id, topic_id, difficulty, expires_at, current_turn_user_id, turn_number)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [challengerUserId, challengedUserId, topicId, difficulty, expiresAt, challengerUserId],
    )
    const challengeId = challengeResult.insertId

    // Immediately start the challenger's quiz
    // Use challengeId as seed so both players get the same questions
    const seed = challengeId
    const quiz = await quizService.startQuiz(
      challengerUserId,
      topicId,
      difficulty,
      10,
      null,
      null,
      seed,
    )

    // Add challenge_id to the quiz payload so frontend knows it's a challenge quiz
    quiz.challenge_id = challengeId

    // Link the quiz to the challenge and mark as active
    const isChallenger = true
    await connection.execute(
      `UPDATE challenges
       SET ${isChallenger ? 'challenger_quiz_id' : 'challenged_quiz_id'} = ?,
           status = CASE
             WHEN status = 'accepted'
             THEN 'active'
             ELSE status
           END,
           started_at = CASE
             WHEN started_at IS NULL
             THEN NOW()
             ELSE started_at
           END
       WHERE id = ?`,
      [quiz.quiz_id, challengeId],
    )

    await connection.commit()

    const challenge = await challengeRepository.getChallengeById(challengeId)

    // Return both challenge and quiz data
    return {
      challenge,
      quiz,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
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
    throw createError('Challenge not found', 404)
  }

  // Only the challenged user can accept
  if (challenge.challenged_user_id !== userId) {
    throw createError('You are not authorized to accept this challenge', 403)
  }

  if (challenge.status !== 'pending') {
    throw createError('This challenge cannot be accepted', 409)
  }

  // Check if expired
  if (challenge.expires_at && new Date(challenge.expires_at) < new Date()) {
    await challengeRepository.updateChallengeStatus(challengeId, 'expired')
    throw createError('This challenge has expired', 410)
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
    throw createError('Challenge not found', 404)
  }

  // Only the challenged user can decline
  if (challenge.challenged_user_id !== userId) {
    throw createError('You are not authorized to decline this challenge', 403)
  }

  if (challenge.status !== 'pending') {
    throw createError('This challenge cannot be declined', 409)
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
    throw createError('Challenge not found', 404)
  }

  // User must be part of the challenge
  validateUserInChallenge(challenge, userId)

  // Challenge must be accepted or active
  if (challenge.status !== 'accepted' && challenge.status !== 'active') {
    throw createError('Challenge is not ready to start', 409)
  }

  // Check if it's the user's turn
  if (challenge.current_turn_user_id !== userId) {
    throw createError('It is not your turn', 403)
  }

  // Check if user already has a quiz for this challenge
  const isChallenger = challenge.challenger_user_id === userId
  const existingQuizId = isChallenger ? challenge.challenger_quiz_id : challenge.challenged_quiz_id

  if (existingQuizId) {
    // Return existing quiz details
    return getQuizDetailsWithChallenge(existingQuizId, userId)
  }

  // For challenged player, copy the challenger's quiz questions
  if (!isChallenger && challenge.challenger_quiz_id) {
    // Get the challenger's quiz questions
    const [challengerQuestions] = await pool.query(
      `SELECT question_id, position, question_snapshot
       FROM quiz_questions
       WHERE quiz_id = ?
       ORDER BY position`,
      [challenge.challenger_quiz_id],
    )

    if (challengerQuestions.length === 0) {
      throw createError('Challenger quiz has no questions', 500)
    }

    // Create a new quiz for the challenged player
    const connection = await pool.getConnection()
    let quizId

    try {
      await connection.beginTransaction()

      // Insert quiz session
      const [qResult] = await connection.execute(
        `INSERT INTO quizzes (user_id, topic_id, difficulty, total_cnt, status)
         VALUES (?, ?, ?, ?, 'in_progress')`,
        [userId, challenge.topic_id, challenge.difficulty, challengerQuestions.length],
      )
      quizId = qResult.insertId

      // Copy question snapshots from challenger's quiz
      for (const question of challengerQuestions) {
        await connection.execute(
          `INSERT INTO quiz_questions (quiz_id, question_id, position, question_snapshot)
           VALUES (?, ?, ?, ?)`,
          [quizId, question.question_id, question.position, question.question_snapshot],
        )
      }

      await connection.commit()
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }

    // Link the quiz to the challenge
    const linked = await challengeRepository.linkQuizToChallenge(challengeId, userId, quizId)

    if (!linked) {
      // If we couldn't link it, someone else might have just done it
      const updatedChallenge = await challengeRepository.getChallengeById(challengeId)
      const finalQuizId = isChallenger
        ? updatedChallenge.challenger_quiz_id
        : updatedChallenge.challenged_quiz_id
      return getQuizDetailsWithChallenge(finalQuizId, userId)
    }

    // Get and return the quiz details
    return getQuizDetailsWithChallenge(quizId, userId)
  }

  // For challenger (creating challenge) - this shouldn't happen as challenger quiz is created in createChallenge
  // But keeping this as fallback
  const seed = challenge.id
  const quiz = await quizService.startQuiz(
    userId,
    challenge.topic_id,
    challenge.difficulty,
    10,
    null,
    null,
    seed,
  )

  // Link the quiz to the challenge
  const linked = await challengeRepository.linkQuizToChallenge(challengeId, userId, quiz.quiz_id)

  if (!linked) {
    // If we couldn't link it, someone else might have just done it
    const updatedChallenge = await challengeRepository.getChallengeById(challengeId)
    const finalQuizId = isChallenger
      ? updatedChallenge.challenger_quiz_id
      : updatedChallenge.challenged_quiz_id
    return getQuizDetailsWithChallenge(finalQuizId, userId)
  }

  // Add challenge_id to the quiz payload so frontend knows it's a challenge quiz
  quiz.challenge_id = challengeId
  return quiz
}

/**
 * Get quiz details with challenge context
 * Finds which challenge (if any) owns this quiz and adds challenge_id to payload
 */
async function getQuizDetailsWithChallenge(quizId, userId) {
  const quizDetails = await quizService.getQuizDetails(quizId, userId)

  // Find if this quiz belongs to a challenge
  const [challenges] = await pool.query(
    `SELECT id FROM challenges
     WHERE challenger_quiz_id = ? OR challenged_quiz_id = ?`,
    [quizId, quizId],
  )

  quizDetails.challenge_id = challenges.length > 0 ? challenges[0].id : null

  return quizDetails
}

/**
 * Get challenge progress (for polling)
 */
async function getChallengeProgress(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw createError('Challenge not found', 404)
  }

  // User must be part of the challenge
  validateUserInChallenge(challenge, userId)

  const progress = await challengeRepository.getChallengeProgress(challengeId)

  if (!progress) {
    throw createError('Challenge progress not found', 404)
  }

  const isChallenger = challenge.challenger_user_id === userId

  return {
    challenge_id: challengeId,
    status: progress.status,
    your_progress: {
      answered_count: isChallenger
        ? progress.challenger_answered || 0
        : progress.challenged_answered || 0,
      total_count: isChallenger ? progress.challenger_total || 10 : progress.challenged_total || 10,
      is_completed: isChallenger
        ? progress.challenger_quiz_status === 'completed'
        : progress.challenged_quiz_status === 'completed',
    },
    opponent_progress: {
      answered_count: isChallenger
        ? progress.challenged_answered || 0
        : progress.challenger_answered || 0,
      total_count: isChallenger ? progress.challenged_total || 10 : progress.challenger_total || 10,
      is_completed: isChallenger
        ? progress.challenged_quiz_status === 'completed'
        : progress.challenger_quiz_status === 'completed',
    },
  }
}

/**
 * Handle quiz completion and turn switching
 * Called when a user completes their quiz
 */
async function handleQuizCompletion(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw createError('Challenge not found', 404)
  }

  // User must be part of the challenge
  validateUserInChallenge(challenge, userId)

  // Challenge must be pending, accepted, or active
  if (challenge.status !== 'pending' && challenge.status !== 'accepted' && challenge.status !== 'active') {
    throw createError('Challenge is not in a valid state for completion', 409)
  }

  // Check if both players have completed their current turn
  const [quizzes] = await pool.query(
    `SELECT
      q.id,
      q.user_id,
      q.status,
      q.total_score,
      q.created_at,
      q.completed_at,
      TIMESTAMPDIFF(SECOND, q.created_at, q.completed_at) AS time_taken_seconds
     FROM quizzes q
     WHERE q.id IN (?, ?)`,
    [challenge.challenger_quiz_id, challenge.challenged_quiz_id],
  )

  const challengerQuiz = quizzes.find((q) => q.user_id === challenge.challenger_user_id)
  const challengedQuiz = quizzes.find((q) => q.user_id === challenge.challenged_user_id)

  // Identify the caller's quiz
  const callerQuiz = userId === challenge.challenger_user_id ? challengerQuiz : challengedQuiz

  // Validate that the caller's quiz is completed
  if (!callerQuiz || callerQuiz.status !== 'completed') {
    throw createError('Your quiz must be completed before proceeding', 400)
  }

  // If both players have completed their quizzes for this turn, determine winner and switch turn
  if (challengerQuiz?.status === 'completed' && challengedQuiz?.status === 'completed') {
    await determineWinnerAndComplete(challengeId, challengerQuiz, challengedQuiz)
  } else {
    // Only one player has completed, switch turn to the other player
    await challengeRepository.switchTurn(challengeId, userId)
  }
}

/**
 * Get challenge result (when both users have completed)
 */
async function getChallengeResult(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw createError('Challenge not found', 404)
  }

  // User must be part of the challenge
  validateUserInChallenge(challenge, userId)

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
    turn_number: challenge.turn_number,
    current_turn_user_id: challenge.current_turn_user_id,
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
 * Determine winner based on score only, then mark challenge as completed
 */
async function determineWinnerAndComplete(challengeId, challengerQuiz, challengedQuiz) {
  let winnerId = null

  // Winner = highest score only, ignore time
  if (challengerQuiz.total_score > challengedQuiz.total_score) {
    winnerId = challengerQuiz.user_id
  } else if (challengedQuiz.total_score > challengerQuiz.total_score) {
    winnerId = challengedQuiz.user_id
  }
  // If scores are equal, winnerId stays null (tie)

  await challengeRepository.completeChallenge(challengeId, winnerId)
}

/**
 * Mark that a user has viewed the challenge result
 */
async function markResultViewed(challengeId, userId) {
  const challenge = await challengeRepository.getChallengeById(challengeId)

  if (!challenge) {
    throw createError('Challenge not found', 404)
  }

  // User must be part of the challenge
  validateUserInChallenge(challenge, userId)

  // Only allow marking result as viewed if challenge is completed
  if (challenge.status !== 'completed') {
    throw createError('Challenge must be completed before marking result as viewed', 409)
  }

  await challengeRepository.markResultViewed(challengeId, userId)

  return { message: 'Result marked as viewed' }
}

/**
 * Search users by username (for finding opponents)
 */
async function searchUsers(query, excludeUserId) {
  if (!query || query.length < 2) {
    throw createError('Search query must be at least 2 characters', 400)
  }

  const [users] = await pool.query(
    `SELECT id, username
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
  handleQuizCompletion,
  getChallengeProgress,
  getChallengeResult,
  markResultViewed,
  searchUsers,
}

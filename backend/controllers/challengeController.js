const challengeService = require('../services/challengeService')

/**
 * Validate and parse a challenge ID route parameter.
 */
function validateChallengeId(id) {
  const challengeId = Number(id)
  if (!Number.isInteger(challengeId) || challengeId < 1) {
    const error = new Error('Ogiltigt utmanings-ID.')
    error.status = 400
    throw error
  }
  return challengeId
}

/**
 * Format and send controller error responses.
 */
function handleError(res, err) {
  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500
  if (status === 500) console.error(err)
  res.status(status).json({
    status: 'error',
    message: status === 500 ? 'Ett serverfel uppstod. Försök igen senare.' : err.message,
  })
}

/**
 * Create a new challenge
 * POST /api/challenges
 */
async function createChallenge(req, res) {
  try {
    const userId = req.session.userId
    const { challenged_user_id, topic_id, difficulty } = req.body

    if (!challenged_user_id || !topic_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Välj både en motståndare och ett ämne.',
      })
    }

    const challengedUserId = Number(challenged_user_id)
    const topicId = Number(topic_id)
    const difficultyLevel = difficulty !== undefined && difficulty !== null ? Number(difficulty) : 1

    if (!Number.isInteger(challengedUserId) || challengedUserId < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Ogiltigt användar-ID för motståndaren.',
      })
    }

    if (!Number.isInteger(topicId) || topicId < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Ogiltigt ämnes-ID.',
      })
    }

    if (!Number.isInteger(difficultyLevel) || difficultyLevel < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Svårighetsgraden måste vara ett positivt heltal.',
      })
    }

    const challenge = await challengeService.createChallenge(
      userId,
      challengedUserId,
      topicId,
      difficultyLevel,
    )

    res.status(201).json({ status: 'success', data: challenge })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Get pending challenges (incoming invitations)
 * GET /api/challenges/pending
 */
async function getPendingChallenges(req, res) {
  try {
    const userId = req.session.userId
    const challenges = await challengeService.getPendingChallenges(userId)
    res.json({ status: 'success', data: challenges })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Get active challenges (quiz in progress)
 * GET /api/challenges/active
 */
async function getActiveChallenges(req, res) {
  try {
    const userId = req.session.userId
    const challenges = await challengeService.getActiveChallenges(userId)
    res.json({ status: 'success', data: challenges })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Get challenge history (completed challenges)
 * GET /api/challenges/history
 */
async function getChallengeHistory(req, res) {
  try {
    const userId = req.session.userId
    const challenges = await challengeService.getChallengeHistory(userId)
    res.json({ status: 'success', data: challenges })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Accept a challenge
 * POST /api/challenges/:id/accept
 */
async function acceptChallenge(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    const challenge = await challengeService.acceptChallenge(challengeId, userId)
    res.json({ status: 'success', data: challenge })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Decline a challenge
 * POST /api/challenges/:id/decline
 */
async function declineChallenge(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    const result = await challengeService.declineChallenge(challengeId, userId)
    res.json({ status: 'success', data: result })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Start a challenge quiz
 * POST /api/challenges/:id/start
 */
async function startChallengeQuiz(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    const quiz = await challengeService.startChallengeQuiz(challengeId, userId)
    res.json({ status: 'success', data: quiz })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Get challenge progress (for polling)
 * GET /api/challenges/:id/progress
 */
async function getChallengeProgress(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    const progress = await challengeService.getChallengeProgress(challengeId, userId)
    res.json({ status: 'success', data: progress })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Get challenge result
 * GET /api/challenges/:id/result
 */
async function getChallengeResult(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    const result = await challengeService.getChallengeResult(challengeId, userId)
    res.json({ status: 'success', data: result })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Handle quiz completion for a challenge
 * POST /api/challenges/:id/complete
 */
async function handleQuizCompletion(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    await challengeService.handleQuizCompletion(challengeId, userId)
    res.json({ status: 'success', message: 'Turen har gått vidare.' })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Mark that user has viewed the challenge result
 * POST /api/challenges/:id/mark-viewed
 */
async function markResultViewed(req, res) {
  try {
    const userId = req.session.userId
    const challengeId = validateChallengeId(req.params.id)
    const result = await challengeService.markResultViewed(challengeId, userId)
    res.json({ status: 'success', data: result })
  } catch (err) {
    handleError(res, err)
  }
}

/**
 * Search users by username (for finding opponents)
 * GET /api/challenges/users/search?q=username
 */
async function searchUsers(req, res) {
  try {
    const userId = req.session.userId
    const query = req.query.q
    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Sökfrågan q krävs.' })
    }

    const users = await challengeService.searchUsers(query, userId)
    res.json({ status: 'success', data: users })
  } catch (err) {
    handleError(res, err)
  }
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

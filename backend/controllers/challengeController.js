const challengeService = require('../services/challengeService')

/**
 * Create a new challenge
 * POST /api/challenges
 */
async function createChallenge(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const { challenged_user_id, topic_id, difficulty } = req.body

    if (!challenged_user_id || !topic_id) {
      return res.status(400).json({
        status: 'error',
        message: 'challenged_user_id and topic_id are required',
      })
    }

    const challenge = await challengeService.createChallenge(
      userId,
      Number(challenged_user_id),
      Number(topic_id),
      Number(difficulty || 1),
    )

    res.status(201).json({ status: 'success', data: challenge })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

/**
 * Get pending challenges (incoming invitations)
 * GET /api/challenges/pending
 */
async function getPendingChallenges(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challenges = await challengeService.getPendingChallenges(userId)
    res.json({ status: 'success', data: challenges })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/**
 * Get active challenges (quiz in progress)
 * GET /api/challenges/active
 */
async function getActiveChallenges(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challenges = await challengeService.getActiveChallenges(userId)
    res.json({ status: 'success', data: challenges })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/**
 * Get challenge history (completed challenges)
 * GET /api/challenges/history
 */
async function getChallengeHistory(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challenges = await challengeService.getChallengeHistory(userId)
    res.json({ status: 'success', data: challenges })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

/**
 * Accept a challenge
 * POST /api/challenges/:id/accept
 */
async function acceptChallenge(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challengeId = Number(req.params.id)
    if (!Number.isInteger(challengeId) || challengeId < 1) {
      return res.status(400).json({ status: 'error', message: 'Invalid challenge ID' })
    }

    const challenge = await challengeService.acceptChallenge(challengeId, userId)
    res.json({ status: 'success', data: challenge })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

/**
 * Decline a challenge
 * POST /api/challenges/:id/decline
 */
async function declineChallenge(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challengeId = Number(req.params.id)
    if (!Number.isInteger(challengeId) || challengeId < 1) {
      return res.status(400).json({ status: 'error', message: 'Invalid challenge ID' })
    }

    const result = await challengeService.declineChallenge(challengeId, userId)
    res.json({ status: 'success', data: result })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

/**
 * Start a challenge quiz
 * POST /api/challenges/:id/start
 */
async function startChallengeQuiz(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challengeId = Number(req.params.id)
    if (!Number.isInteger(challengeId) || challengeId < 1) {
      return res.status(400).json({ status: 'error', message: 'Invalid challenge ID' })
    }

    const quiz = await challengeService.startChallengeQuiz(challengeId, userId)
    res.json({ status: 'success', data: quiz })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

/**
 * Get challenge progress (for polling)
 * GET /api/challenges/:id/progress
 */
async function getChallengeProgress(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challengeId = Number(req.params.id)
    if (!Number.isInteger(challengeId) || challengeId < 1) {
      return res.status(400).json({ status: 'error', message: 'Invalid challenge ID' })
    }

    const progress = await challengeService.getChallengeProgress(challengeId, userId)
    res.json({ status: 'success', data: progress })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

/**
 * Get challenge result
 * GET /api/challenges/:id/result
 */
async function getChallengeResult(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const challengeId = Number(req.params.id)
    if (!Number.isInteger(challengeId) || challengeId < 1) {
      return res.status(400).json({ status: 'error', message: 'Invalid challenge ID' })
    }

    const result = await challengeService.getChallengeResult(challengeId, userId)
    res.json({ status: 'success', data: result })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

/**
 * Search users by username (for finding opponents)
 * GET /api/challenges/users/search?q=username
 */
async function searchUsers(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const query = req.query.q
    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Query parameter q is required' })
    }

    const users = await challengeService.searchUsers(query, userId)
    res.json({ status: 'success', data: users })
  } catch (err) {
    const status = err.status || 500
    res.status(status).json({ status: 'error', message: err.message })
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
  getChallengeProgress,
  getChallengeResult,
  searchUsers,
}

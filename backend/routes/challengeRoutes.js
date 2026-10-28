const express = require('express')
const router = express.Router()
const challengeController = require('../controllers/challengeController')

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  next()
}

// Create a new challenge
router.post('/api/challenges', requireAuth, challengeController.createChallenge)

// Get challenges lists
router.get('/api/challenges/pending', requireAuth, challengeController.getPendingChallenges)
router.get('/api/challenges/active', requireAuth, challengeController.getActiveChallenges)
router.get('/api/challenges/history', requireAuth, challengeController.getChallengeHistory)

// Search users for challenging
router.get('/api/challenges/users/search', requireAuth, challengeController.searchUsers)

// Accept/Decline challenge
router.post('/api/challenges/:id/accept', requireAuth, challengeController.acceptChallenge)
router.post('/api/challenges/:id/decline', requireAuth, challengeController.declineChallenge)

// Start challenge quiz
router.post('/api/challenges/:id/start', requireAuth, challengeController.startChallengeQuiz)

// Get challenge progress (for polling during quiz)
router.get('/api/challenges/:id/progress', requireAuth, challengeController.getChallengeProgress)

// Get challenge result (when completed)
router.get('/api/challenges/:id/result', requireAuth, challengeController.getChallengeResult)

module.exports = router

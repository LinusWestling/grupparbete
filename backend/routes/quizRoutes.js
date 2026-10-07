const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  next()
}

router.post('/api/quizzes/start', quizController.startQuiz)
router.post('/api/quizzes/:quizId/submit', quizController.submitQuizSession)
router.get('/api/quizzes/history', requireAuth, quizController.getHistory)
router.get('/api/quizzes/:quizId', quizController.getQuizDetails)

module.exports = router

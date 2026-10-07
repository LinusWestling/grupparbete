const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  next()
}

router.get('/api/questions', questionController.getQuestions)
router.get('/api/questions/:id', questionController.getQuestionById)
router.post('/api/questions', requireAuth, questionController.createQuestion)
router.put('/api/questions/:id', requireAuth, questionController.updateQuestion)
router.delete('/api/questions/:id', requireAuth, questionController.deleteQuestion)

module.exports = router

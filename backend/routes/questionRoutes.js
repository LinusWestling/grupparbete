const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')
const { requireAdmin } = require('../middleware/auth')

router.get('/api/questions', questionController.getQuestions)
router.get('/api/questions/:id', questionController.getQuestionById)
router.post('/api/questions', requireAdmin, questionController.createQuestion)
router.put('/api/questions/:id', requireAdmin, questionController.updateQuestion)
router.delete('/api/questions/:id', requireAdmin, questionController.deleteQuestion)

module.exports = router

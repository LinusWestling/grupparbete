const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')

router.get('/api/questions', questionController.getQuestions)
router.get('/api/questions/:id', questionController.getQuestionById)
router.post('/api/questions', questionController.createQuestion)
router.put('/api/questions/:id', questionController.updateQuestion)
router.delete('/api/questions/:id', questionController.deleteQuestion)

module.exports = router

const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')

// Mounted at /api/admin behind requireAdmin in app.js, so every route here is admin-only.
router.get('/questions', questionController.getAdminQuestions)
router.get('/questions/:id', questionController.getAdminQuestionById)
router.post('/questions', questionController.createQuestion)
router.put('/questions/:id', questionController.updateQuestion)
router.delete('/questions/:id', questionController.deleteQuestion)

module.exports = router

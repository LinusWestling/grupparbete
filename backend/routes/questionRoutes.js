const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')

// Public reads for players; never include correct answers. Admin routes live in adminRoutes.js.
router.get('/api/questions', questionController.getQuestions)
router.get('/api/questions/:id', questionController.getQuestionById)

module.exports = router

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/api/quizzes/practice', quizController.getPracticeQuiz);
router.get('/api/quizzes/speedrun', quizController.getSpeedrunQuiz);
router.post('/api/quizzes/submit', quizController.submitQuiz);

module.exports = router;

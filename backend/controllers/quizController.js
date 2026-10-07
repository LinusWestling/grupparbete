const quizService = require('../services/quiz/quizService');

async function getPracticeQuiz(req, res) {
  try {
    const { topicId, difficulty, limit } = req.query;
    const questions = await quizService.getPracticeQuiz(topicId, difficulty, limit || 10);
    res.json({ status: 'success', data: questions });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getSpeedrunQuiz(req, res) {
  try {
    const { limit } = req.query;
    const questions = await quizService.getSpeedrunQuiz(limit || 15);
    res.json({ status: 'success', data: questions });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

async function submitQuiz(req, res) {
  try {
    const { userId, submissions } = req.body;
    if (!submissions || !Array.isArray(submissions)) {
      return res.status(400).json({ status: 'error', message: 'submissions array is required' });
    }
    const result = await quizService.submitQuiz(userId || null, submissions);
    res.json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  getPracticeQuiz,
  getSpeedrunQuiz,
  submitQuiz,
};

const quizService = require('../services/quiz/quizService')

async function startQuiz(req, res) {
  try {
    const { topicId, difficulty, limit } = req.body || {}
    if (!topicId) {
      return res.status(400).json({ status: 'error', message: 'topicId is required' })
    }
    const userId = req.session?.userId || null
    const quizSession = await quizService.startQuiz(
      userId,
      Number(topicId),
      Number(difficulty || 1),
      Number(limit || 10),
    )
    res.json({ status: 'success', data: quizSession })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function submitQuizSession(req, res) {
  try {
    const quizId = Number(req.params.quizId)
    const { submissions } = req.body || {}
    if (!submissions || !Array.isArray(submissions)) {
      return res.status(400).json({ status: 'error', message: 'submissions array is required' })
    }
    const userId = req.session?.userId || null
    const result = await quizService.submitQuizSession(quizId, userId, submissions)
    res.json({ status: 'success', data: result })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function getHistory(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const history = await quizService.getUserQuizHistory(userId)
    res.json({ status: 'success', data: history })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function getQuizDetails(req, res) {
  try {
    const quizId = Number(req.params.quizId)
    const userId = req.session?.userId || null
    const details = await quizService.getQuizDetails(quizId, userId)
    if (!details) {
      return res.status(404).json({ status: 'error', message: 'Quiz history record not found' })
    }
    res.json({ status: 'success', data: details })
  } catch (err) {
    const status = err.message === 'Forbidden' ? 403 : 500
    res.status(status).json({ status: 'error', message: err.message })
  }
}

module.exports = {
  startQuiz,
  submitQuizSession,
  getHistory,
  getQuizDetails,
}

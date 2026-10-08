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
    if (submissions !== undefined && !Array.isArray(submissions)) {
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
  async getUnfinishedQuizzes(req, res) {
    try {
      const quizzes = await quizService.getUnfinishedQuizzes(req.session.userId)
      res.json({ status: 'success', data: quizzes })
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
    }
  },
  async saveQuestionProgress(req, res) {
    try {
      const quizId = Number(req.params.quizId)
      const questionId = Number(req.params.questionId)
      if (
        !Number.isInteger(quizId) ||
        quizId < 1 ||
        !Number.isInteger(questionId) ||
        questionId < 1
      ) {
        return res.status(400).json({ status: 'error', message: 'Invalid quiz or question ID' })
      }
      const progress = await quizService.saveQuestionProgress(
        quizId,
        req.session.userId,
        questionId,
        req.body || {},
      )
      res.json({ status: 'success', data: progress })
    } catch (error) {
      res.status(error.status || 500).json({ status: 'error', message: error.message })
    }
  },
}

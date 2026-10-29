const quizService = require('../services/quiz/quizService')

function sendError(res, error) {
  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500
  if (status === 500) console.error(error)
  res.status(status).json({
    status: 'error',
    message: status === 500 ? 'Ett serverfel uppstod. Försök igen senare.' : error.message,
  })
}

async function startQuiz(req, res) {
  try {
    const { topicId, difficulty, limit } = req.body || {}
    if (!topicId) {
      return res.status(400).json({ status: 'error', message: 'Välj ett ämne.' })
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
    sendError(res, err)
  }
}

async function submitQuizSession(req, res) {
  try {
    const quizId = Number(req.params.quizId)
    if (!Number.isInteger(quizId) || quizId < 1) {
      return res.status(400).json({ status: 'error', message: 'Ogiltigt quiz-ID.' })
    }
    const { submissions } = req.body || {}
    if (!Array.isArray(submissions)) {
      return res.status(400).json({ status: 'error', message: 'En lista med svar krävs.' })
    }
    const userId = req.session?.userId || null
    const result = await quizService.submitQuizSession(quizId, userId, submissions)
    res.json({ status: 'success', data: result })
  } catch (err) {
    sendError(res, err)
  }
}

async function getHistory(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Du måste vara inloggad.' })
    }
    const history = await quizService.getUserQuizHistory(userId)
    res.json({ status: 'success', data: history })
  } catch (err) {
    sendError(res, err)
  }
}

async function getQuizDetails(req, res) {
  try {
    const quizId = Number(req.params.quizId)
    const userId = req.session?.userId || null
    const details = await quizService.getQuizDetails(quizId, userId)
    if (!details) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Quizet hittades inte i historiken.' })
    }
    res.json({ status: 'success', data: details })
  } catch (err) {
    sendError(res, err)
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
      sendError(res, error)
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
        return res.status(400).json({ status: 'error', message: 'Ogiltigt quiz- eller fråge-ID.' })
      }
      const progress = await quizService.saveQuestionProgress(
        quizId,
        req.session.userId,
        questionId,
        req.body || {},
      )
      res.json({ status: 'success', data: progress })
    } catch (error) {
      sendError(res, error)
    }
  },
}

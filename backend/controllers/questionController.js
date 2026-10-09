const questionService = require('../services/questionService')
const { validateQuestion } = require('../services/questionValidation')

// Client errors (4xx) keep their message and any field errors; anything else is a 500.
function sendError(res, err) {
  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500
  if (status === 500) console.error(err)
  res.status(status).json({
    status: 'error',
    message: status === 500 ? 'Server error' : err.message,
    ...(err.errors && { errors: err.errors }),
  })
}

function readFilters(query) {
  return {
    topic_id: query.topicId,
    question_type: query.type,
    difficulty: query.difficulty,
    search: query.search,
  }
}

async function getQuestions(req, res) {
  try {
    const questions = await questionService.getQuestions({
      ...readFilters(req.query),
      limit: req.query.limit,
    })
    res.json({ status: 'success', data: questions })
  } catch (err) {
    sendError(res, err)
  }
}

async function getQuestionById(req, res) {
  try {
    const question = await questionService.getQuestionById(req.params.id)
    if (!question || question.deleted_at) {
      return res.status(404).json({ status: 'error', message: 'Question not found' })
    }
    res.json({ status: 'success', data: question })
  } catch (err) {
    sendError(res, err)
  }
}

// Admin reads include correct answers and how often each question has been used.
async function getAdminQuestions(req, res) {
  try {
    const questions = await questionService.getQuestions(readFilters(req.query), {
      includeCorrect: true,
      includeUsage: true,
    })
    res.json({ status: 'success', data: questions })
  } catch (err) {
    sendError(res, err)
  }
}

async function getAdminQuestionById(req, res) {
  try {
    const question = await questionService.getQuestionById(req.params.id, {
      includeCorrect: true,
      includeUsage: true,
    })
    if (!question || question.deleted_at) {
      return res.status(404).json({ status: 'error', message: 'Question not found' })
    }
    res.json({ status: 'success', data: question })
  } catch (err) {
    sendError(res, err)
  }
}

async function createQuestion(req, res) {
  try {
    const data = validateQuestion(req.body)
    const newQuestion = await questionService.createQuestion({
      ...data,
      created_by: req.session.userId,
    })
    res.status(201).json({ status: 'success', data: newQuestion })
  } catch (err) {
    sendError(res, err)
  }
}

async function updateQuestion(req, res) {
  try {
    const data = validateQuestion(req.body)
    const updated = await questionService.updateQuestion(req.params.id, data)
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Question not found' })
    }
    res.json({ status: 'success', data: updated })
  } catch (err) {
    sendError(res, err)
  }
}

async function deleteQuestion(req, res) {
  try {
    const success = await questionService.deleteQuestion(req.params.id)
    if (!success) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Question not found or already deleted' })
    }
    res.json({ status: 'success', message: 'Question deleted successfully' })
  } catch (err) {
    sendError(res, err)
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
  getAdminQuestions,
  getAdminQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
}

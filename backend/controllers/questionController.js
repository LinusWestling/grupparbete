const questionService = require('../services/questionService')

async function getQuestions(req, res) {
  try {
    const questions = await questionService.getQuestions({
      topic_id: req.query.topicId,
      question_type: req.query.type,
      difficulty: req.query.difficulty,
      limit: req.query.limit,
    })
    res.json({ status: 'success', data: questions })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function getQuestionById(req, res) {
  try {
    const question = await questionService.getQuestionById(req.params.id)
    if (!question) {
      return res.status(404).json({ status: 'error', message: 'Question not found' })
    }
    res.json({ status: 'success', data: question })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function createQuestion(req, res) {
  try {
    const { topic_id, question_text, question_type, difficulty_level, answers, sources } =
      req.body || {}
    if (!topic_id || !question_text) {
      return res
        .status(400)
        .json({ status: 'error', message: 'topic_id and question_text are required' })
    }
    const newQuestion = await questionService.createQuestion({
      topic_id,
      created_by: req.session?.userId || null,
      question_text,
      question_type,
      difficulty_level,
      answers,
      sources,
    })
    res.status(201).json({ status: 'success', data: newQuestion })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function updateQuestion(req, res) {
  try {
    const { topic_id, question_text } = req.body || {}
    if (!topic_id || !question_text) {
      return res
        .status(400)
        .json({ status: 'error', message: 'topic_id and question_text are required' })
    }
    const updated = await questionService.updateQuestion(req.params.id, req.body)
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Question not found' })
    }
    res.json({ status: 'success', data: updated })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
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
    res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
}

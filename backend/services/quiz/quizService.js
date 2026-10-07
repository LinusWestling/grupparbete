const pool = require('../../database/pool')
const questionService = require('../questionService')
const multipleChoiceEngine = require('./multipleChoiceEngine')
const yesNoEngine = require('./yesNoEngine')
const freeTextEngine = require('./freeTextEngine')

async function getPracticeQuiz(topicId, difficulty, limit = 10) {
  return await questionService.getQuestions({
    topic_id: topicId,
    difficulty: difficulty,
    limit: limit,
  })
}

async function getSpeedrunQuiz(limit = 15) {
  return await questionService.getQuestions({
    limit: limit,
  })
}

async function submitQuiz(userId, submissions) {
  let score = 0
  const results = []

  for (const item of submissions) {
    const question = await questionService.getQuestionById(item.question_id)
    if (!question) continue

    let evaluation
    switch (question.question_type) {
      case 'yes_no':
        evaluation = yesNoEngine.evaluate(question, item.answer)
        break
      case 'free_text':
        evaluation = freeTextEngine.evaluate(question, item.answer)
        break
      case 'multiple_choice':
      default:
        evaluation = multipleChoiceEngine.evaluate(question, item.answer)
        break
    }

    if (evaluation.is_correct) {
      score += 10 // 10 XP per correct answer
    }
    results.push(evaluation)

    // Save answer attempt history if user is logged in
    if (userId) {
      const answerId =
        typeof evaluation.chosen_answer_id === 'number' ? evaluation.chosen_answer_id : null
      await pool.execute(
        `INSERT INTO user_answers (user_id, question_id, answer_id, is_correct)
         VALUES (?, ?, ?, ?)`,
        [userId, question.id, answerId, evaluation.is_correct ? 1 : 0],
      )
    }
  }

  // Update User Progress XP and Level if user logged in
  if (userId && score > 0) {
    await updateUserXP(userId, score)
  }

  return {
    total_questions: results.length,
    correct_count: results.filter((r) => r.is_correct).length,
    xp_earned: score,
    results: results,
  }
}

async function updateUserXP(userId, xpEarned) {
  const [rows] = await pool.query('SELECT * FROM user_progress WHERE user_id = ? LIMIT 1', [userId])

  if (rows.length === 0) {
    await pool.execute(
      'INSERT INTO user_progress (user_id, topic_id, level, xp_points) VALUES (?, 1, 1, ?)',
      [userId, xpEarned],
    )
  } else {
    const currentXp = (rows[0].xp_points || 0) + xpEarned
    const newLevel = Math.floor(currentXp / 100) + 1
    await pool.execute('UPDATE user_progress SET xp_points = ?, level = ? WHERE id = ?', [
      currentXp,
      newLevel,
      rows[0].id,
    ])
  }
}

module.exports = {
  getPracticeQuiz,
  getSpeedrunQuiz,
  submitQuiz,
}

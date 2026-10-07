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
  const xpPerTopic = new Map()
  const results = []

  for (const item of submissions) {
    const question = await questionService.getQuestionForEvaluation(item.question_id)
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
      const currentXp = xpPerTopic.get(question.topic_id) || 0
      xpPerTopic.set(question.topic_id, currentXp + 10) // 10 XP per correct answer
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

  // Update User Progress XP and Level per (user_id, topic_id) if user logged in
  if (userId && xpPerTopic.size > 0) {
    for (const [topicId, xpEarned] of xpPerTopic.entries()) {
      await updateUserXP(userId, topicId, xpEarned)
    }
  }

  const totalXpEarned = Array.from(xpPerTopic.values()).reduce((sum, val) => sum + val, 0)

  return {
    total_questions: results.length,
    correct_count: results.filter((r) => r.is_correct).length,
    xp_earned: totalXpEarned,
    results: results,
  }
}

async function updateUserXP(userId, topicId, xpEarned) {
  await pool.execute(
    `INSERT INTO user_progress (user_id, topic_id, level, xp_points)
     VALUES (?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE 
       xp_points = xp_points + VALUES(xp_points),
       level = FLOOR((xp_points + VALUES(xp_points)) / 100) + 1`,
    [userId, topicId, xpEarned],
  )
}

module.exports = {
  getPracticeQuiz,
  getSpeedrunQuiz,
  submitQuiz,
}

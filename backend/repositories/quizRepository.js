const pool = require('../database/pool')

async function getLatestQuizQuestionIds(userId, topicId, difficulty) {
  if (!userId) return []

  const [rows] = await pool.execute(
    `SELECT qq.question_id
         FROM quiz_questions qq
         WHERE qq.quiz_id = (
          SELECT q.id
          FROM quizzes q
          WHERE q.user_id = ?
            AND q.topic_id = ?
            AND q.difficulty = ?
          ORDER BY q.created_at DESC, q.id DESC
          LIMIT 1
          )
          ORDER BY qq.position ASC`,
    [userId, topicId, difficulty],
  )

  return rows.map((row) => Number(row.question_id))
}

module.exports = { getLatestQuizQuestionIds }

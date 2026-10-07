const pool = require('../database/pool')

async function getDashboardStats() {
  const [[topics]] = await pool.query('SELECT COUNT(*) AS total FROM topics')
  const [[questions]] = await pool.query('SELECT COUNT(*) AS total FROM questions')
  const [[answers]] = await pool.query('SELECT COUNT(*) AS total FROM user_answers')

  return {
    total_topics: topics.total,
    total_questions: questions.total,
    total_quiz_attempts: answers.total,
  }
}

async function getUserProgress(userId) {
  const [progress] = await pool.query(
    `SELECT up.id, up.user_id, up.topic_id, up.level, up.xp_points AS xp, t.name AS topic_name 
     FROM user_progress up
     LEFT JOIN topics t ON up.topic_id = t.id
     WHERE up.user_id = ?`,
    [userId],
  )

  const [[historyCount]] = await pool.query(
    'SELECT COUNT(*) AS total, SUM(is_correct) AS correct FROM user_answers WHERE user_id = ?',
    [userId],
  )

  return {
    progress_by_topic: progress,
    total_answered: historyCount.total || 0,
    total_correct: historyCount.correct || 0,
  }
}

module.exports = {
  getDashboardStats,
  getUserProgress,
}

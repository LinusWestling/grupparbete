const pool = require('../database/pool')

async function getProspects(filters = {}) {
  let sql = `
    SELECT u.id, u.username, u.email, u.created_at
    FROM users u
    WHERE u.role = 'user' AND u.is_public_prospect = TRUE
  `
  const params = []

  if (filters.search) {
    sql += ' AND (u.username LIKE ? OR u.email LIKE ?)'
    params.push(`%${filters.search}%`, `%${filters.search}%`)
  }

  sql += ' ORDER BY u.created_at DESC'

  const [prospects] = await pool.query(sql, params)

  if (prospects.length === 0) return []

  const prospectIds = prospects.map((p) => p.id)

  const [progressRows] = await pool.query(
    `SELECT up.user_id, up.topic_id, up.level, up.xp_points AS xp, t.name AS topic_name
     FROM user_progress up
     JOIN topics t ON up.topic_id = t.id
     WHERE up.user_id IN (?)`,
    [prospectIds],
  )

  const [statsRows] = await pool.query(
    `SELECT user_id, COUNT(*) AS total_answered, SUM(is_correct) AS total_correct
     FROM user_answers
     WHERE user_id IN (?)
     GROUP BY user_id`,
    [prospectIds],
  )

  const [quizRows] = await pool.query(
    `SELECT user_id, COUNT(*) AS quizzes_completed
     FROM quizzes
     WHERE user_id IN (?) AND status = 'completed'
     GROUP BY user_id`,
    [prospectIds],
  )

  const progressMap = new Map()
  for (const r of progressRows) {
    if (!progressMap.has(r.user_id)) progressMap.set(r.user_id, [])
    progressMap.get(r.user_id).push(r)
  }

  const statsMap = new Map(statsRows.map((s) => [s.user_id, s]))
  const quizMap = new Map(quizRows.map((q) => [q.user_id, q.quizzes_completed]))

  return prospects.map((p) => {
    const topicProgress = progressMap.get(p.id) || []
    const stats = statsMap.get(p.id) || { total_answered: 0, total_correct: 0 }
    const totalAnswered = stats.total_answered || 0
    const totalCorrect = Number(stats.total_correct) || 0
    const totalXp = topicProgress.reduce((sum, tp) => sum + (tp.xp || 0), 0)
    const overallLevel = Math.min(5, Math.floor(totalXp / 100) + 1)
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    return {
      id: p.id,
      username: p.username,
      email: p.email,
      overall_level: overallLevel,
      total_xp: totalXp,
      total_answered: totalAnswered,
      total_correct: totalCorrect,
      accuracy_percentage: accuracy,
      quizzes_completed: quizMap.get(p.id) || 0,
      topic_progress: topicProgress,
    }
  })
}

async function getProspectDetails(prospectId) {
  const [userRows] = await pool.query(
    'SELECT id, username, email, role, is_public_prospect, created_at FROM users WHERE id = ?',
    [prospectId],
  )

  if (userRows.length === 0) return null
  const prospect = userRows[0]

  if (!prospect.is_public_prospect) {
    throw Object.assign(new Error('Prospect profile is private'), { status: 403 })
  }

  const [topicProgress] = await pool.query(
    `SELECT up.id, up.topic_id, up.level, up.xp_points AS xp, t.name AS topic_name
     FROM user_progress up
     JOIN topics t ON up.topic_id = t.id
     WHERE up.user_id = ?`,
    [prospectId],
  )

  const [history] = await pool.query(
    `SELECT q.id AS quiz_id, q.topic_id, t.name AS topic_name, q.difficulty, q.total_score,
            q.correct_cnt, q.total_cnt, q.completed_at
     FROM quizzes q
     JOIN topics t ON q.topic_id = t.id
     WHERE q.user_id = ? AND q.status = 'completed'
     ORDER BY q.completed_at DESC`,
    [prospectId],
  )

  const [[stats]] = await pool.query(
    'SELECT COUNT(*) AS total, SUM(is_correct) AS correct FROM user_answers WHERE user_id = ?',
    [prospectId],
  )

  const totalAnswered = stats ? stats.total || 0 : 0
  const totalCorrect = stats ? Number(stats.correct) || 0 : 0
  const totalXp = topicProgress.reduce((sum, tp) => sum + (tp.xp || 0), 0)
  const overallLevel = Math.min(5, Math.floor(totalXp / 100) + 1)
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return {
    id: prospect.id,
    username: prospect.username,
    email: prospect.email,
    created_at: prospect.created_at,
    overall_level: overallLevel,
    total_xp: totalXp,
    total_answered: totalAnswered,
    total_correct: totalCorrect,
    accuracy_percentage: accuracy,
    topic_progress: topicProgress,
    quiz_history: history,
  }
}

module.exports = {
  getProspects,
  getProspectDetails,
}

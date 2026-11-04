const pool = require('../database/pool')

async function getProspects(viewerUser, filters = {}) {
  const viewerId = viewerUser?.id || 0
  const isAdminViewer = viewerUser?.role === 'admin'

  let sql = `
    SELECT u.id, u.username, u.created_at, par.status AS access_status
    FROM users u
    LEFT JOIN prospect_access_requests par
      ON par.candidate_id = u.id AND par.organization_id = ?
    WHERE u.role = 'user' AND u.is_public_prospect = TRUE
  `
  const params = [viewerId]

  if (filters.search) {
    sql += ' AND u.username LIKE ?'
    params.push(`%${filters.search}%`)
  }

  sql += ' ORDER BY u.created_at DESC'

  const [prospects] = await pool.query(sql, params)

  if (prospects.length === 0) return []

  const approvedIds = prospects
    .filter((p) => isAdminViewer || p.access_status === 'approved')
    .map((p) => p.id)

  const progressMap = new Map()
  let statsMap = new Map()
  let quizMap = new Map()

  if (approvedIds.length > 0) {
    const [progressRows] = await pool.query(
      `SELECT up.user_id, up.topic_id, up.level, up.xp_points AS xp, t.name AS topic_name
       FROM user_progress up
       JOIN topics t ON up.topic_id = t.id
       WHERE up.user_id IN (?)`,
      [approvedIds],
    )

    const [statsRows] = await pool.query(
      `SELECT user_id, COUNT(*) AS total_answered, SUM(is_correct) AS total_correct
       FROM user_answers
       WHERE user_id IN (?)
       GROUP BY user_id`,
      [approvedIds],
    )

    const [quizRows] = await pool.query(
      `SELECT user_id, COUNT(*) AS quizzes_completed
       FROM quizzes
       WHERE user_id IN (?) AND status = 'completed'
       GROUP BY user_id`,
      [approvedIds],
    )

    for (const r of progressRows) {
      if (!progressMap.has(r.user_id)) progressMap.set(r.user_id, [])
      progressMap.get(r.user_id).push(r)
    }

    statsMap = new Map(statsRows.map((s) => [s.user_id, s]))
    quizMap = new Map(quizRows.map((q) => [q.user_id, q.quizzes_completed]))
  }

  return prospects.map((p) => {
    const accessStatus = isAdminViewer ? 'approved' : p.access_status || 'none'
    const isApproved = accessStatus === 'approved'

    if (!isApproved) {
      return {
        id: p.id,
        username: p.username,
        access_status: accessStatus,
        overall_level: null,
        total_xp: null,
        total_answered: null,
        total_correct: null,
        accuracy_percentage: null,
        quizzes_completed: null,
        topic_progress: [],
      }
    }

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
      access_status: accessStatus,
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

async function requestProspectAccess(organizationId, candidateId) {
  const [userRows] = await pool.query(
    "SELECT id, is_public_prospect FROM users WHERE id = ? AND role = 'user'",
    [candidateId],
  )

  if (userRows.length === 0) {
    throw Object.assign(new Error('Kandidaten hittades inte.'), { status: 404 })
  }

  if (!userRows[0].is_public_prospect) {
    throw Object.assign(new Error('Kandidaten tar inte emot förfrågningar från organisationer.'), {
      status: 403,
    })
  }

  await pool.execute(
    `INSERT INTO prospect_access_requests (organization_id, candidate_id, status)
     VALUES (?, ?, 'pending')
     ON DUPLICATE KEY UPDATE
       status = IF(status = 'approved', 'approved', 'pending'),
       requested_at = IF(status = 'approved', requested_at, CURRENT_TIMESTAMP),
       responded_at = IF(status = 'approved', responded_at, NULL)`,
    [organizationId, candidateId],
  )

  const [[row]] = await pool.execute(
    'SELECT status FROM prospect_access_requests WHERE organization_id = ? AND candidate_id = ?',
    [organizationId, candidateId],
  )

  return { access_status: row ? row.status : 'pending' }
}

async function getProspectDetails(viewerUser, prospectId) {
  const [userRows] = await pool.query(
    "SELECT id, username, role, is_public_prospect, created_at FROM users WHERE id = ? AND role = 'user'",
    [prospectId],
  )

  if (userRows.length === 0) return null
  const prospect = userRows[0]

  if (!prospect.is_public_prospect) {
    throw Object.assign(new Error('Kandidatens profil är privat.'), { status: 403 })
  }

  if (viewerUser?.role !== 'admin') {
    const [[accessRow]] = await pool.execute(
      'SELECT status FROM prospect_access_requests WHERE organization_id = ? AND candidate_id = ?',
      [viewerUser?.id || 0, prospectId],
    )
    if (!accessRow || accessRow.status !== 'approved') {
      throw Object.assign(
        new Error('Åtkomst nekad: kandidaten har ännu inte godkänt din organisation.'),
        { status: 403 },
      )
    }
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

  const [assignments] = await pool.execute(
    `SELECT q.id AS quiz_id, t.name AS topic_name, q.difficulty, q.total_cnt,
       q.correct_cnt, q.status, q.created_at, q.completed_at
     FROM quizzes q JOIN topics t ON t.id = q.topic_id
     WHERE q.user_id = ? AND q.organization_id = ? ORDER BY q.created_at DESC, q.id DESC`,
    [prospectId, viewerUser.id],
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
    created_at: prospect.created_at,
    overall_level: overallLevel,
    total_xp: totalXp,
    total_answered: totalAnswered,
    total_correct: totalCorrect,
    accuracy_percentage: accuracy,
    topic_progress: topicProgress,
    quiz_history: history,
    assignments,
  }
}

module.exports = {
  getProspects,
  requestProspectAccess,
  getProspectDetails,
}

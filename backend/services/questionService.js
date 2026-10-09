const pool = require('../database/pool')

function formatAnswers(answers, includeCorrect = false) {
  return answers.map((a) => {
    if (includeCorrect) return a
    const { is_correct, ...rest } = a
    return rest
  })
}

async function getQuestions(filters = {}, options = {}) {
  const { includeCorrect = false } = options
  let sql = `
    SELECT 
      q.id,
      q.topic_id,
      t.name AS topic_name,
      q.created_by,
      q.question_type,
      q.question_text,
      q.difficulty_level,
      q.created_at
    FROM questions q
    JOIN topics t ON q.topic_id = t.id
    WHERE 1=1
  `
  const params = []

  if (filters.topic_id) {
    sql += ' AND q.topic_id = ?'
    params.push(filters.topic_id)
  }
  if (filters.question_type) {
    sql += ' AND q.question_type = ?'
    params.push(filters.question_type)
  }
  if (filters.difficulty) {
    sql += ' AND q.difficulty_level = ?'
    params.push(filters.difficulty)
  }
  if (filters.limit) {
    sql += ' ORDER BY RAND() LIMIT ?'
    params.push(Number(filters.limit))
  } else {
    sql += ' ORDER BY q.id DESC'
  }

  const [questions] = await pool.query(sql, params)

  if (questions.length === 0) return []

  // Bulk fetch answers and sources for all question IDs
  const qIds = questions.map((q) => q.id)
  const [allAnswers] = await pool.query(
    'SELECT id, question_id, answer_text, is_correct FROM answers WHERE question_id IN (?)',
    [qIds],
  )
  const [allSources] = await pool.query(
    'SELECT id, question_id, source_text, url FROM sources WHERE question_id IN (?)',
    [qIds],
  )

  // Group by question_id
  const answersByQuestion = new Map()
  for (const a of allAnswers) {
    if (!answersByQuestion.has(a.question_id)) {
      answersByQuestion.set(a.question_id, [])
    }
    answersByQuestion.get(a.question_id).push(a)
  }

  const sourcesByQuestion = new Map()
  for (const s of allSources) {
    if (!sourcesByQuestion.has(s.question_id)) {
      sourcesByQuestion.set(s.question_id, [])
    }
    const { question_id, ...srcRest } = s
    sourcesByQuestion.get(s.question_id).push(srcRest)
  }

  for (const q of questions) {
    const rawAnswers = answersByQuestion.get(q.id) || []
    q.answers = formatAnswers(rawAnswers, includeCorrect)
    q.sources = sourcesByQuestion.get(q.id) || []
  }

  return questions
}

async function getQuestionById(id, options = {}) {
  const { includeCorrect = false } = options
  const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [id])
  if (rows.length === 0) return null
  const question = rows[0]

  const [answers] = await pool.query(
    'SELECT id, answer_text, is_correct FROM answers WHERE question_id = ?',
    [id],
  )
  const [sources] = await pool.query(
    'SELECT id, source_text, url FROM sources WHERE question_id = ?',
    [id],
  )
  question.answers = formatAnswers(answers, includeCorrect)
  question.sources = sources
  return question
}

async function getQuestionForEvaluation(id) {
  return await getQuestionById(id, { includeCorrect: true })
}

async function createQuestion(data) {
  const connection = await pool.getConnection()
  let questionId
  try {
    await connection.beginTransaction()

    const [qResult] = await connection.execute(
      `INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.topic_id,
        data.created_by || null,
        data.question_type || 'multiple_choice',
        data.question_text,
        data.difficulty_level || 1,
      ],
    )
    questionId = qResult.insertId

    if (data.answers && Array.isArray(data.answers)) {
      for (const ans of data.answers) {
        await connection.execute(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [questionId, ans.answer_text, ans.is_correct ? 1 : 0],
        )
      }
    }

    if (data.sources && Array.isArray(data.sources)) {
      for (const src of data.sources) {
        await connection.execute(
          'INSERT INTO sources (question_id, source_text, url) VALUES (?, ?, ?)',
          [questionId, src.source_text, src.url || null],
        )
      }
    }

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return await getQuestionById(questionId, { includeCorrect: true })
}

async function updateQuestion(id, data) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(
      `UPDATE questions 
       SET topic_id = ?, question_type = ?, question_text = ?, difficulty_level = ?
       WHERE id = ?`,
      [data.topic_id, data.question_type, data.question_text, data.difficulty_level, id],
    )

    if (result.affectedRows === 0) {
      await connection.rollback()
      return null
    }

    if (data.answers && Array.isArray(data.answers)) {
      await connection.execute('DELETE FROM answers WHERE question_id = ?', [id])
      for (const ans of data.answers) {
        await connection.execute(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [id, ans.answer_text, ans.is_correct ? 1 : 0],
        )
      }
    }

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return await getQuestionById(id, { includeCorrect: true })
}

async function deleteQuestion(id) {
  const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [id])
  return result.affectedRows > 0
}

async function getAvailableDifficulties(topic_id) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT difficulty_level
    FROM questions
    WHERE topic_id = ?
      AND difficulty_level BETWEEN 1 AND 5
    ORDER BY difficulty_level ASC`,
    [topic_id],
  )

  return rows.map((row) => Number(row.difficulty_level))
}

module.exports = {
  getQuestions,
  getQuestionById,
  getQuestionForEvaluation,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAvailableDifficulties,
}

const pool = require('../database/pool')

function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

function formatAnswers(answers, includeCorrect = false) {
  return answers.map((a) => {
    if (includeCorrect) return a
    const { is_correct, ...rest } = a
    return rest
  })
}

async function getQuestions(filters = {}, options = {}) {
  const { includeCorrect = false, includeUsage = false } = options
  // usage_count tells the admin UI whether a question already appears in quizzes.
  const usageColumn = includeUsage
    ? '(SELECT COUNT(*) FROM quiz_questions qq WHERE qq.question_id = q.id) AS usage_count,'
    : ''
  let sql = `
    SELECT ${usageColumn}
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
    WHERE q.deleted_at IS NULL
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
  if (filters.search) {
    // Escape LIKE wildcards so a search for "50%" matches literally.
    const escaped = String(filters.search).replace(/[\\%_]/g, '\\$&')
    sql += ' AND q.question_text LIKE ?'
    params.push(`%${escaped}%`)
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

// Also returns soft-deleted questions, so quiz history and started quizzes still load.
async function getQuestionById(id, options = {}) {
  const { includeCorrect = false, includeUsage = false } = options
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
  if (includeUsage) {
    const [[{ usage }]] = await pool.query(
      'SELECT COUNT(*) AS `usage` FROM quiz_questions WHERE question_id = ?',
      [id],
    )
    question.usage_count = usage
  }
  return question
}

async function getQuestionForEvaluation(id) {
  return await getQuestionById(id, { includeCorrect: true })
}

async function assertTopicExists(connection, topicId) {
  const [rows] = await connection.execute('SELECT id FROM topics WHERE id = ?', [topicId])
  if (rows.length === 0) throw httpError(400, 'Choose a topic that exists')
}

async function insertAnswers(connection, questionId, answers) {
  for (const ans of answers) {
    await connection.execute(
      'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
      [questionId, ans.answer_text, ans.is_correct ? 1 : 0],
    )
  }
}

async function replaceSources(connection, questionId, sources) {
  // Nothing references sources, so replacing them all is safe.
  await connection.execute('DELETE FROM sources WHERE question_id = ?', [questionId])
  for (const src of sources) {
    await connection.execute(
      'INSERT INTO sources (question_id, source_text, url) VALUES (?, ?, ?)',
      [questionId, src.source_text, src.url],
    )
  }
}

// Expects data already checked by questionValidation.
async function createQuestion(data) {
  const connection = await pool.getConnection()
  let questionId
  try {
    await connection.beginTransaction()
    await assertTopicExists(connection, data.topic_id)

    const [qResult] = await connection.execute(
      `INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.topic_id,
        data.created_by || null,
        data.question_type,
        data.question_text,
        data.difficulty_level,
      ],
    )
    questionId = qResult.insertId

    await insertAnswers(connection, questionId, data.answers)
    await replaceSources(connection, questionId, data.sources)

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return await getQuestionById(questionId, { includeCorrect: true })
}

async function isAnyAnswerChosen(connection, answerIds) {
  if (answerIds.length === 0) return false
  const [[{ chosen }]] = await connection.query(
    `SELECT
       (SELECT COUNT(*) FROM quiz_questions WHERE chosen_answer_id IN (?)) +
       (SELECT COUNT(*) FROM user_answers WHERE answer_id IN (?)) AS chosen`,
    [answerIds, answerIds],
  )
  return chosen > 0
}

// Expects data already checked by questionValidation. Answers are updated in
// place by id, so quiz history that points at an answer keeps pointing at it.
// Answers sent without an id are added; existing answers left out are removed.
async function updateQuestion(id, data) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [questionRows] = await connection.execute(
      'SELECT question_type FROM questions WHERE id = ? AND deleted_at IS NULL FOR UPDATE',
      [id],
    )
    if (questionRows.length === 0) {
      await connection.rollback()
      return null
    }
    await assertTopicExists(connection, data.topic_id)

    const [[{ usage }]] = await connection.execute(
      'SELECT COUNT(*) AS `usage` FROM quiz_questions WHERE question_id = ?',
      [id],
    )
    if (usage > 0 && questionRows[0].question_type !== data.question_type) {
      throw httpError(
        409,
        'This question has been used in quizzes, so its type cannot change. Delete it and create a new question instead.',
      )
    }

    const [existingRows] = await connection.execute(
      'SELECT id, is_correct FROM answers WHERE question_id = ?',
      [id],
    )
    const existingCorrect = new Map(existingRows.map((row) => [row.id, Boolean(row.is_correct)]))
    const keptIds = new Set()
    const correctnessChangedIds = []
    for (const ans of data.answers) {
      if (ans.id === null) continue
      if (!existingCorrect.has(ans.id)) {
        throw httpError(400, `Answer ${ans.id} does not belong to this question`)
      }
      keptIds.add(ans.id)
      if (existingCorrect.get(ans.id) !== ans.is_correct) correctnessChangedIds.push(ans.id)
    }

    // Results are stored per attempt, so a chosen answer's correctness must not
    // change or history and in-progress grading would disagree with the key.
    if (await isAnyAnswerChosen(connection, correctnessChangedIds)) {
      throw httpError(
        409,
        'An answer whose correctness you changed has been chosen in quizzes. Delete the question and create a new one instead.',
      )
    }

    const removedIds = [...existingCorrect.keys()].filter((answerId) => !keptIds.has(answerId))
    if (removedIds.length > 0) {
      if (await isAnyAnswerChosen(connection, removedIds)) {
        throw httpError(
          409,
          'An answer you removed has been chosen in quizzes. Edit its text instead of removing it.',
        )
      }
      await connection.query('DELETE FROM answers WHERE id IN (?)', [removedIds])
    }

    await connection.execute(
      `UPDATE questions
       SET topic_id = ?, question_type = ?, question_text = ?, difficulty_level = ?
       WHERE id = ?`,
      [data.topic_id, data.question_type, data.question_text, data.difficulty_level, id],
    )

    for (const ans of data.answers.filter((a) => a.id !== null)) {
      await connection.execute(
        'UPDATE answers SET answer_text = ?, is_correct = ? WHERE id = ? AND question_id = ?',
        [ans.answer_text, ans.is_correct ? 1 : 0, ans.id, id],
      )
    }
    await insertAnswers(
      connection,
      id,
      data.answers.filter((a) => a.id === null),
    )
    await replaceSources(connection, id, data.sources)

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return await getQuestionById(id, { includeCorrect: true })
}

// Soft delete: completed quizzes still reference the question and its answers.
async function deleteQuestion(id) {
  const [result] = await pool.execute(
    'UPDATE questions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
    [id],
  )
  return result.affectedRows > 0
}

async function getAvailableDifficulties(topic_id) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT difficulty_level
    FROM questions
    WHERE topic_id = ?
      AND deleted_at IS NULL
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

const quizPayload = require('./quizPayload')
const pool = require('../../database/pool')
const questionService = require('../questionService')
const { submitQuizSession, existingAnswerId } = require('./submitQuiz')
const { httpError, readJson, validateAnswer } = require('./quizSubmission')
const { orderQuizAnswers, orderMatchOptions } = require('../../utils/quizAnswerOrder')
const quizRepository = require('../../repositories/quizRepository')
const { randomInt } = require('node:crypto')

async function startQuiz(userId, topicId, difficulty = 1, limit = 10, organizationId = null, questionTypes) {
  // Fetch questions matching topic and difficulty level (or fallback to topic)
  let questions = await questionService.getQuestions(
    { 
      topic_id: topicId,
      difficulty,
      limit,
      question_types: questionTypes,
     },
    { includeCorrect: true },
  )

  let actualDifficulty = Number(difficulty)

  if (questions.length === 0 && topicId) {
    const availableLevels = await questionService.getAvailableDifficulties(topicId, questionTypes,)

    if (availableLevels.length > 0) {
      actualDifficulty = availableLevels.reduce((closest, level) => {
        const levelDistance = Math.abs(level - Number(difficulty))
        const closestDistance = Math.abs(closest - Number(difficulty))

        return levelDistance < closestDistance ? level : closest
      })

      questions = await questionService.getQuestions(
        {
          topic_id: topicId,
          difficulty: actualDifficulty,
          limit,
          question_types: questionTypes,
        },
        { includeCorrect: true },
      )
    }
  }

  if (questions.length === 0) {
    throw httpError(
      400,
      'Det finns inga frågor för det valda ämnet och den valda svårighetsgraden.',
    )
  }

  const previousQuestionIds = await quizRepository.getLatestQuizQuestionIds(
    userId,
    topicId,
    actualDifficulty,
  )

  if (previousQuestionIds.length > 0) {
    questions = await questionService.getQuestions(
      {
        topic_id: topicId,
        difficulty: actualDifficulty,
        limit,
        question_types: questionTypes,
      },
      {
        includeCorrect: true,
        previousQuestionIds,
      },
    )
  }

  for (let i = questions.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)

    const temporary = questions[i]
    questions[i] = questions[j]
    questions[j] = temporary
  }

  const connection = await pool.getConnection()
  let quizId

  try {
    await connection.beginTransaction()

    if (organizationId !== null) {
      const [access] = await connection.execute(
        `SELECT u.id FROM users u JOIN prospect_access_requests par ON par.candidate_id = u.id
         WHERE u.id = ? AND u.role = 'user' AND u.is_public_prospect = TRUE
         AND par.organization_id = ? AND par.status = 'approved' FOR SHARE`,
        [userId, organizationId],
      )
      if (!access.length)
        throw httpError(403, 'Kandidaten måste godkänna åtkomst innan du kan tilldela ett test.')
    }

    // Insert quiz session into database
    const [qResult] = await connection.execute(
      `INSERT INTO quizzes (user_id, topic_id, difficulty, total_cnt, organization_id, status)
       VALUES (?, ?, ?, ?, ?, 'in_progress')`,
      [
        userId || null,
        topicId || questions[0].topic_id,
        actualDifficulty || 1,
        questions.length,
        organizationId,
      ],
    )
    quizId = qResult.insertId

    // Freeze the same ordered content used by the browser and server grading.
    questions = questions.map((question) => {
      const orderedAnswers =
        question.question_type === 'multiple_choice' || question.question_type === 'matching'
          ? orderQuizAnswers(question.answers, quizId, question.id)
          : question.answers
      return {
        ...question,
        answers: orderedAnswers,
        ...(question.question_type === 'matching'
          ? { match_options: orderMatchOptions(orderedAnswers, quizId, question.id) }
          : {}),
      }
    })
    // Link questions to quiz session
    for (let i = 0; i < questions.length; i++) {
      await connection.execute(
        `INSERT INTO quiz_questions (quiz_id, question_id, position, question_snapshot)
         VALUES (?, ?, ?, ?)`,
        [quizId, questions[i].id, i + 1, JSON.stringify(questions[i])],
      )
    }

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return quizPayload(
    {
      status: 'in_progress',
      quiz_id: quizId,
      topic_id: topicId || questions[0].topic_id,
      topic_name: questions[0].topic_name,
      difficulty: actualDifficulty,
      requested_difficulty: Number(difficulty),
      total_questions: questions.length,
    },
    questions,
  )
}

async function getUserQuizHistory(userId) {
  const sql = `
    SELECT 
      q.id AS quiz_id,
      q.topic_id,
      t.name AS topic_name,
      q.difficulty,
      q.total_score,
      q.correct_cnt,
      q.total_cnt,
      q.status,
      q.created_at,
      q.completed_at
    FROM quizzes q
    JOIN topics t ON q.topic_id = t.id
    WHERE q.user_id = ? AND q.status = 'completed'
    ORDER BY q.completed_at DESC
  `
  const [rows] = await pool.query(sql, [userId])
  return rows
}

async function getQuizDetails(quizId, userId) {
  const [qRows] = await pool.query(
    `SELECT q.*, t.name AS topic_name 
     FROM quizzes q
     JOIN topics t ON q.topic_id = t.id
     WHERE q.id = ?`,
    [quizId],
  )
  if (qRows.length === 0) return null
  const quiz = qRows[0]

  // Deny access if quiz has an owner and that owner differs from caller (including when userId is null)
  if (
    (quiz.user_id !== null && quiz.user_id !== userId) ||
    (quiz.status === 'in_progress' && !userId)
  ) {
    throw httpError(403, 'Åtkomst nekad.')
  }

  const [rows] = await pool.query(
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY position',
    [quizId],
  )
  const questions = rows.map((row) => {
    const snapshot = readJson(row.question_snapshot)
    if (!snapshot) throw httpError(409, 'Quizets sparade innehåll är inte tillgängligt.')
    const isFreeText = snapshot.question_type === 'free_text'
    const isMatching = snapshot.question_type === 'matching'
    const answer = isFreeText ? null : readJson(row.submitted_answer)
    return {
      ...snapshot,
      question_id: row.question_id,
      position: row.position,
      is_correct: row.is_correct,
      progress_revision: row.progress_revision,
      is_answered: Boolean(row.is_answered),
      is_skipped: Boolean(row.is_skipped),
      chosen_answer_id: isFreeText || isMatching ? null : (answer ?? row.chosen_answer_id),
      free_text_answer: isFreeText ? row.free_text_answer : null,
      submitted_answer: answer,
    }
  })
  const { result_snapshot, ...metadata } = quiz
  return quizPayload(metadata, questions)
}

async function getUnfinishedQuizzes(userId) {
  const [rows] = await pool.query(
    `SELECT q.id AS quiz_id, q.difficulty, q.total_cnt, t.name AS topic_name,
      org.username AS organization_name,
      SUM(qq.is_answered) AS answered_count, SUM(qq.is_skipped) AS skipped_count
     FROM quizzes q JOIN topics t ON t.id = q.topic_id
     LEFT JOIN users org ON org.id = q.organization_id
     JOIN quiz_questions qq ON qq.quiz_id = q.id
     WHERE q.user_id = ? AND q.status = 'in_progress'
     GROUP BY q.id, q.difficulty, q.total_cnt, t.name, org.username ORDER BY q.created_at DESC`,
    [userId],
  )
  return rows
}

async function saveQuestionProgress(
  quizId,
  userId,
  questionId,
  { answer, isSkipped = false, revision },
) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [quizzes] = await connection.query('SELECT * FROM quizzes WHERE id = ? FOR UPDATE', [
      quizId,
    ])
    const quiz = quizzes[0]
    if (!quiz) throw Object.assign(new Error('Quizet hittades inte.'), { status: 404 })
    if (!userId || quiz.user_id !== userId)
      throw Object.assign(new Error('Åtkomst nekad.'), { status: 403 })
    if (quiz.status !== 'in_progress')
      throw Object.assign(new Error('Quizet är redan slutfört.'), { status: 409 })
    const [rows] = await connection.query(
      'SELECT question_snapshot, progress_revision, is_answered, is_skipped FROM quiz_questions WHERE quiz_id = ? AND question_id = ?',
      [quizId, questionId],
    )
    if (!rows.length) throw httpError(404, 'Frågan ingår inte i quizet.')
    const question = readJson(rows[0].question_snapshot)
    validateAnswer(question, { answer, isSkipped })
    if (!Number.isSafeInteger(revision) || revision < 1 || revision > 4294967295) {
      throw httpError(400, 'En giltig version av quizets framsteg krävs.')
    }
    if (revision <= rows[0].progress_revision) {
      if (revision < rows[0].progress_revision)
        throw httpError(409, 'En nyare version av quizets framsteg har redan sparats.')
      await connection.commit()
      return {
        question_id: questionId,
        is_answered: Boolean(rows[0].is_answered),
        is_skipped: Boolean(rows[0].is_skipped),
        revision: rows[0].progress_revision,
      }
    }
    const chosenAnswerId = await existingAnswerId(connection, question, { answer, isSkipped })
    const freeTextAnswer = !isSkipped && question.question_type === 'free_text' ? answer : null
    await connection.execute(
      `UPDATE quiz_questions SET chosen_answer_id = ?, free_text_answer = ?,
       is_answered = ?, is_skipped = ?, submitted_answer = ?, progress_revision = ?, is_correct = NULL
       WHERE quiz_id = ? AND question_id = ?`,
      [
        chosenAnswerId,
        freeTextAnswer,
        !isSkipped,
        isSkipped,
        JSON.stringify(isSkipped ? null : answer),
        revision,
        quizId,
        questionId,
      ],
    )
    await connection.commit()
    return { question_id: questionId, is_answered: !isSkipped, is_skipped: isSkipped }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  startQuiz,
  submitQuizSession,
  getUserQuizHistory,
  getQuizDetails,
  getUnfinishedQuizzes,
  saveQuestionProgress,
}

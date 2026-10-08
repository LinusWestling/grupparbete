const pool = require('../../database/pool')
const questionService = require('../questionService')
const multipleChoiceEngine = require('./multipleChoiceEngine')
const yesNoEngine = require('./yesNoEngine')
const freeTextEngine = require('./freeTextEngine')

async function startQuiz(userId, topicId, difficulty = 1, limit = 10) {
  // Fetch questions matching topic and difficulty level (or fallback to topic)
  let questions = await questionService.getQuestions(
    { topic_id: topicId, difficulty: difficulty, limit: limit },
    { includeCorrect: false },
  )

  let actualDifficulty = Number(difficulty)

  if (questions.length === 0 && topicId) {
    const availableLevels = await questionService.getAvailableDifficulties(topicId)

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
        },
        { includeCorrect: false },
      )
    }
  }

  if (questions.length === 0) {
    throw new Error('No questions found for the selected topic and difficulty level')
  }

  const connection = await pool.getConnection()
  let quizId

  try {
    await connection.beginTransaction()

    // Insert quiz session into database
    const [qResult] = await connection.execute(
      `INSERT INTO quizzes (user_id, topic_id, difficulty, total_cnt, status)
       VALUES (?, ?, ?, ?, 'in_progress')`,
      [userId || null, topicId || questions[0].topic_id, actualDifficulty || 1, questions.length],
    )
    quizId = qResult.insertId

    // Link questions to quiz session
    for (let i = 0; i < questions.length; i++) {
      await connection.execute(
        `INSERT INTO quiz_questions (quiz_id, question_id, position)
         VALUES (?, ?, ?)`,
        [quizId, questions[i].id, i + 1],
      )
    }

    await connection.commit()
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }

  return {
    quiz_id: quizId,
    topic_id: topicId || questions[0].topic_id,
    topic_name: questions[0].topic_name,
    difficulty: actualDifficulty,
    requested_difficulty: Number(difficulty),
    total_questions: questions.length,
    questions: questions.map((question) => ({
      ...question,
      is_answered: false,
      is_skipped: false,
    })),
  }
}

async function submitQuizSession(quizId, userId, submissions) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Lock the quiz row in a transaction to prevent race conditions & duplicate submissions
    const [qRows] = await connection.query('SELECT * FROM quizzes WHERE id = ? FOR UPDATE', [
      quizId,
    ])
    if (qRows.length === 0) {
      throw new Error('Quiz session not found')
    }
    const quiz = qRows[0]

    // Verify status is in_progress
    if (quiz.status !== 'in_progress') {
      throw new Error('Quiz session is not in progress')
    }

    // Verify ownership if quiz has an owner
    if (quiz.user_id !== null && quiz.user_id !== userId) {
      throw new Error('Forbidden')
    }

    // Load allowed question IDs for this quiz session
    const [qqRows] = await connection.query(
      'SELECT question_id, is_answered, chosen_answer_id, free_text_answer FROM quiz_questions WHERE quiz_id = ?',
      [quizId],
    )
    const allowedQuestionIds = new Set(qqRows.map((row) => row.question_id))

    let correctCnt = 0
    let totalScore = 0
    const results = []

    // Persisted progress is authoritative when the client submits no answer list.
    const answersToGrade =
      submissions ??
      qqRows
        .filter((row) => row.is_answered)
        .map((row) => ({
          question_id: row.question_id,
          answer: row.free_text_answer ?? row.chosen_answer_id,
        }))
    const gradedQuestionIds = new Set()
    for (const item of answersToGrade) {
      // Skip any submission for a question not belonging to this quiz session
      if (!allowedQuestionIds.has(item.question_id) || gradedQuestionIds.has(item.question_id))
        continue
      gradedQuestionIds.add(item.question_id)

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
        correctCnt++
        totalScore += 10 * quiz.difficulty // Scale XP with difficulty level 1-5
      }
      results.push(evaluation)

      // Update quiz_questions record
      const chosenAnswerId =
        typeof evaluation.chosen_answer_id === 'number' ? evaluation.chosen_answer_id : null
      const freeTextAns = question.question_type === 'free_text' ? String(item.answer || '') : null

      await connection.execute(
        `UPDATE quiz_questions 
         SET chosen_answer_id = ?, free_text_answer = ?, is_correct = ?, is_answered = TRUE, is_skipped = FALSE
         WHERE quiz_id = ? AND question_id = ?`,
        [chosenAnswerId, freeTextAns, evaluation.is_correct ? 1 : 0, quizId, question.id],
      )

      // Log in user_answers history as well
      if (userId) {
        await connection.execute(
          `INSERT INTO user_answers (user_id, question_id, answer_id, is_correct)
           VALUES (?, ?, ?, ?)`,
          [userId, question.id, chosenAnswerId, evaluation.is_correct ? 1 : 0],
        )
      }
    }

    // Update quiz session completion
    await connection.execute(
      `UPDATE quizzes 
       SET total_score = ?, correct_cnt = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [totalScore, correctCnt, quizId],
    )

    // Update User Progress XP and Level per (user_id, topic_id)
    const actualUserId = userId || quiz.user_id
    if (actualUserId && totalScore > 0) {
      await updateUserXP(connection, actualUserId, quiz.topic_id, totalScore)
    }

    await connection.commit()

    return {
      quiz_id: quizId,
      total_questions: quiz.total_cnt || allowedQuestionIds.size,
      correct_count: correctCnt,
      xp_earned: totalScore,
      results: results,
    }
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

async function updateUserXP(connection, userId, topicId, xpEarned) {
  const db = connection || pool
  await db.execute(
    `INSERT INTO user_progress (user_id, topic_id, level, xp_points)
     VALUES (?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE 
       xp_points = xp_points + VALUES(xp_points),
       level = FLOOR((xp_points + VALUES(xp_points)) / 100) + 1`,
    [userId, topicId, xpEarned],
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
  if (quiz.user_id !== null && quiz.user_id !== userId) {
    throw new Error('Forbidden')
  }

  const [qqRows] = await pool.query(
    `SELECT 
       qq.position,
       qq.is_correct,
       qq.is_answered,
       qq.is_skipped,
       qq.chosen_answer_id,
       qq.free_text_answer,
       qn.id AS question_id,
       qn.question_text,
       qn.question_type,
       qn.difficulty_level
     FROM quiz_questions qq
     JOIN questions qn ON qq.question_id = qn.id
     WHERE qq.quiz_id = ?
     ORDER BY qq.position ASC`,
    [quizId],
  )

  for (const item of qqRows) {
    const fullQuestion = await questionService.getQuestionById(item.question_id, {
      includeCorrect: quiz.status === 'completed',
    })
    item.id = item.question_id
    item.is_answered = Boolean(item.is_answered)
    item.is_skipped = Boolean(item.is_skipped)
    item.answers = fullQuestion.answers
    item.sources = fullQuestion.sources
  }

  quiz.questions = qqRows
  return quiz
}

async function getUnfinishedQuizzes(userId) {
  const [rows] = await pool.query(
    `SELECT q.id AS quiz_id, q.difficulty, q.total_cnt, t.name AS topic_name,
      SUM(qq.is_answered) AS answered_count, SUM(qq.is_skipped) AS skipped_count
     FROM quizzes q JOIN topics t ON t.id = q.topic_id
     JOIN quiz_questions qq ON qq.quiz_id = q.id
     WHERE q.user_id = ? AND q.status = 'in_progress'
     GROUP BY q.id, q.difficulty, q.total_cnt, t.name ORDER BY q.created_at DESC`,
    [userId],
  )
  return rows
}

async function saveQuestionProgress(quizId, userId, questionId, { answer, isSkipped = false }) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [quizzes] = await connection.query('SELECT * FROM quizzes WHERE id = ? FOR UPDATE', [
      quizId,
    ])
    const quiz = quizzes[0]
    if (!quiz) throw Object.assign(new Error('Quiz not found'), { status: 404 })
    if (!userId || quiz.user_id !== userId)
      throw Object.assign(new Error('Forbidden'), { status: 403 })
    if (quiz.status !== 'in_progress')
      throw Object.assign(new Error('Quiz is already completed'), { status: 409 })
    const [rows] = await connection.query(
      'SELECT question_id FROM quiz_questions WHERE quiz_id = ? AND question_id = ?',
      [quizId, questionId],
    )
    if (!rows.length) throw Object.assign(new Error('Question not in quiz'), { status: 404 })
    if (typeof isSkipped !== 'boolean')
      throw Object.assign(new Error('isSkipped must be boolean'), { status: 400 })
    const question = await questionService.getQuestionById(questionId)
    if (!question) throw Object.assign(new Error('Question no longer exists'), { status: 404 })
    let chosenAnswerId = null
    let freeTextAnswer = null
    if (!isSkipped) {
      if (question.question_type === 'free_text') {
        if (typeof answer !== 'string' || !answer.trim() || answer.length > 10000) {
          throw Object.assign(new Error('Enter an answer or skip this question'), { status: 400 })
        }
        freeTextAnswer = answer
      } else {
        if (!Number.isInteger(answer) || !question.answers.some((option) => option.id === answer)) {
          throw Object.assign(new Error('Choose an answer or skip this question'), { status: 400 })
        }
        chosenAnswerId = answer
      }
    }
    await connection.execute(
      `UPDATE quiz_questions SET chosen_answer_id = ?, free_text_answer = ?,
       is_answered = ?, is_skipped = ?, is_correct = NULL
       WHERE quiz_id = ? AND question_id = ?`,
      [chosenAnswerId, freeTextAnswer, !isSkipped, isSkipped, quizId, questionId],
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

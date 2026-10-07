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

  if (questions.length === 0 && topicId) {
    // If no questions at specific difficulty level, fallback to any difficulty for that topic
    questions = await questionService.getQuestions(
      { topic_id: topicId, limit: limit },
      { includeCorrect: false },
    )
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
      [userId || null, topicId || questions[0].topic_id, Number(difficulty) || 1, questions.length],
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
    difficulty: Number(difficulty) || 1,
    total_questions: questions.length,
    questions: questions,
  }
}

async function submitQuizSession(quizId, userId, submissions) {
  const [qRows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [quizId])
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
  const [qqRows] = await pool.query('SELECT question_id FROM quiz_questions WHERE quiz_id = ?', [
    quizId,
  ])
  const allowedQuestionIds = new Set(qqRows.map((row) => row.question_id))

  let correctCnt = 0
  let totalScore = 0
  const results = []

  for (const item of submissions) {
    // Skip any submission for a question not belonging to this quiz session
    if (!allowedQuestionIds.has(item.question_id)) continue

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

    await pool.execute(
      `UPDATE quiz_questions 
       SET chosen_answer_id = ?, free_text_answer = ?, is_correct = ?
       WHERE quiz_id = ? AND question_id = ?`,
      [chosenAnswerId, freeTextAns, evaluation.is_correct ? 1 : 0, quizId, question.id],
    )

    // Log in user_answers history as well
    if (userId) {
      await pool.execute(
        `INSERT INTO user_answers (user_id, question_id, answer_id, is_correct)
         VALUES (?, ?, ?, ?)`,
        [userId, question.id, chosenAnswerId, evaluation.is_correct ? 1 : 0],
      )
    }
  }

  // Update quiz session completion
  await pool.execute(
    `UPDATE quizzes 
     SET total_score = ?, correct_cnt = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [totalScore, correctCnt, quizId],
  )

  // Update User Progress XP and Level per (user_id, topic_id)
  const actualUserId = userId || quiz.user_id
  if (actualUserId && totalScore > 0) {
    await updateUserXP(actualUserId, quiz.topic_id, totalScore)
  }

  return {
    quiz_id: quizId,
    total_questions: results.length,
    correct_count: correctCnt,
    xp_earned: totalScore,
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
    const fullQuestion = await questionService.getQuestionForEvaluation(item.question_id)
    item.answers = fullQuestion.answers
    item.sources = fullQuestion.sources
  }

  quiz.questions = qqRows
  return quiz
}

module.exports = {
  startQuiz,
  submitQuizSession,
  getUserQuizHistory,
  getQuizDetails,
}

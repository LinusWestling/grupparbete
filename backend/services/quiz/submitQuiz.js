const pool = require('../../database/pool')
const { httpError, readJson, validateSubmission } = require('./quizSubmission')
const multipleChoice = require('./multipleChoiceEngine')
const yesNo = require('./yesNoEngine')
const freeText = require('./freeTextEngine')

function evaluate(question, item) {
  const engine =
    question.question_type === 'free_text'
      ? freeText
      : question.question_type === 'yes_no'
        ? yesNo
        : multipleChoice
  const evaluation = engine.evaluate(question, item.isSkipped ? undefined : item.answer)
  const selected = question.answers.find((option) => option.id === item.answer)
  return {
    ...evaluation,
    question_text: question.question_text,
    is_correct: !item.isSkipped && evaluation.is_correct,
    is_skipped: item.isSkipped,
    chosen_answer_id: item.isSkipped ? null : (evaluation.chosen_answer_id ?? null),
    user_input: item.isSkipped ? null : (evaluation.user_input ?? null),
    selected_answer_text: item.isSkipped
      ? null
      : question.question_type === 'free_text'
        ? item.answer
        : selected?.answer_text || '',
    sources: question.sources,
  }
}

function summarize(quiz, results) {
  const correctCount = results.filter((result) => result.is_correct).length
  return {
    quiz_id: quiz.id,
    total_questions: results.length,
    correct_count: correctCount,
    skipped_count: results.filter((result) => result.is_skipped).length,
    xp_earned: correctCount * 10 * quiz.difficulty,
    results,
  }
}

async function existingAnswerId(connection, question, item) {
  if (item.isSkipped || question.question_type === 'free_text') return null
  // Preserve old option IDs in submitted_answer even if an admin removed them.
  const [answers] = await connection.execute(
    'SELECT id FROM answers WHERE id = ? AND question_id = ? FOR SHARE',
    [item.answer, question.id],
  )
  return answers.length ? item.answer : null
}

async function submitQuizSession(quizId, userId, submissions) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [quizzes] = await connection.query('SELECT * FROM quizzes WHERE id = ? FOR UPDATE', [
      quizId,
    ])
    const quiz = quizzes[0]
    if (!quiz) throw httpError(404, 'Quiz session not found')
    if (!userId || quiz.user_id !== userId) throw httpError(403, 'Forbidden')
    const [rows] = await connection.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY position',
      [quizId],
    )
    validateSubmission(submissions, rows)
    if (quiz.status === 'completed') {
      let result = readJson(quiz.result_snapshot)
      if (!result) {
        // Legacy completions retain their stored score; never award XP again.
        const results = rows.map((row) => ({
          ...evaluate(readJson(row.question_snapshot), {
            answer: readJson(row.submitted_answer) ?? row.free_text_answer ?? row.chosen_answer_id,
            isSkipped: !row.is_answered || Boolean(row.is_skipped),
          }),
          is_correct: Boolean(row.is_correct),
        }))
        result = {
          ...summarize(quiz, results),
          correct_count: quiz.correct_cnt,
          xp_earned: quiz.total_score,
        }
      }
      await connection.commit()
      return result
    }
    if (quiz.status !== 'in_progress') throw httpError(409, 'Quiz is not in progress')
    const submitted = new Map(submissions.map((item) => [item.question_id, item]))
    const results = []
    for (const row of rows) {
      const question = readJson(row.question_snapshot)
      const item = submitted.get(row.question_id)
      const result = evaluate(question, item)
      results.push(result)
      const answerId = await existingAnswerId(connection, question, item)
      const text = !item.isSkipped && question.question_type === 'free_text' ? item.answer : null
      await connection.execute(
        `UPDATE quiz_questions SET chosen_answer_id = ?, free_text_answer = ?, submitted_answer = ?,
         is_correct = ?, is_answered = ?, is_skipped = ? WHERE quiz_id = ? AND question_id = ?`,
        [
          answerId,
          text,
          JSON.stringify(item.isSkipped ? null : item.answer),
          result.is_correct,
          !item.isSkipped,
          item.isSkipped,
          quizId,
          row.question_id,
        ],
      )
      if (!item.isSkipped)
        await connection.execute(
          'INSERT INTO user_answers (user_id, question_id, answer_id, is_correct) VALUES (?, ?, ?, ?)',
          [userId, row.question_id, answerId, result.is_correct],
        )
    }
    const result = summarize(quiz, results)
    await connection.execute(
      `UPDATE quizzes SET total_score = ?, correct_cnt = ?, status = 'completed',
       completed_at = CURRENT_TIMESTAMP, result_snapshot = ? WHERE id = ?`,
      [result.xp_earned, result.correct_count, JSON.stringify(result), quizId],
    )
    if (result.xp_earned > 0)
      await connection.execute(
        `INSERT INTO user_progress (user_id, topic_id, level, xp_points)
       VALUES (?, ?, FLOOR(? / 100) + 1, ?)
       ON DUPLICATE KEY UPDATE level = FLOOR((xp_points + VALUES(xp_points)) / 100) + 1,
       xp_points = xp_points + VALUES(xp_points)`,
        [userId, quiz.topic_id, result.xp_earned, result.xp_earned],
      )
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = { submitQuizSession, existingAnswerId }

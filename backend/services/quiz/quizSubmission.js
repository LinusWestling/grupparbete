function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

function readJson(value) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

// A final submission contains exactly one entry per question:
// { question_id: integer, answer: option ID | text | null, isSkipped: boolean }.
function validateSubmission(submissions, rows) {
  if (!Array.isArray(submissions) || submissions.length !== rows.length) {
    throw httpError(400, 'Submit an answer or skipped state for every quiz question')
  }
  const questions = new Map(rows.map((row) => [row.question_id, readJson(row.question_snapshot)]))
  const seen = new Set()
  for (const item of submissions) {
    if (
      !item ||
      !Number.isInteger(item.question_id) ||
      !questions.has(item.question_id) ||
      seen.has(item.question_id)
    ) {
      throw httpError(400, 'Question IDs must belong to the quiz and occur exactly once')
    }
    seen.add(item.question_id)
    validateAnswer(questions.get(item.question_id), item)
  }
}

function validateAnswer(question, { answer, isSkipped }) {
  if (!question) throw httpError(409, 'Quiz content snapshot is unavailable')
  if (typeof isSkipped !== 'boolean') throw httpError(400, 'isSkipped must be boolean')
  if (isSkipped) {
    if (answer !== undefined && answer !== null)
      throw httpError(400, 'Skipped questions cannot contain an answer')
  } else if (question.question_type === 'free_text') {
    if (typeof answer !== 'string' || !answer.trim() || answer.length > 10000) {
      throw httpError(400, 'Enter a valid text answer or skip the question')
    }
  } else if (
    !Number.isInteger(answer) ||
    !question.answers.some((option) => option.id === answer)
  ) {
    throw httpError(400, 'Choose an answer from this quiz question or skip it')
  }
}

module.exports = { httpError, readJson, validateSubmission, validateAnswer }

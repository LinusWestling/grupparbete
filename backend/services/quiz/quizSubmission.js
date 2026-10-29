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
    throw httpError(400, 'Besvara varje fråga i quizet eller markera den som överhoppad.')
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
      throw httpError(400, 'Varje fråge-ID måste tillhöra quizet och förekomma exakt en gång.')
    }
    seen.add(item.question_id)
    validateAnswer(questions.get(item.question_id), item)
  }
}

function validateAnswer(question, { answer, isSkipped }) {
  if (!question) throw httpError(409, 'Quizets sparade innehåll är inte tillgängligt.')
  if (typeof isSkipped !== 'boolean')
    throw httpError(400, 'Ange om frågan är överhoppad eller inte.')
  if (isSkipped) {
    if (answer !== undefined && answer !== null)
      throw httpError(400, 'Överhoppade frågor får inte innehålla ett svar.')
  } else if (question.question_type === 'free_text') {
    if (typeof answer !== 'string' || !answer.trim() || answer.length > 10000) {
      throw httpError(400, 'Ange ett giltigt textsvar eller hoppa över frågan.')
    }
  } else if (question.question_type === 'matching') {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      throw httpError(400, 'Matcha alla alternativ i frågan eller hoppa över den.')
    }
    const validMatches = new Set(
      question.answers.map((option) => String(option.match_text ?? '').trim()),
    )
    for (const option of question.answers) {
      const selected = answer[option.id] ?? answer[String(option.id)]
      if (typeof selected !== 'string' || !validMatches.has(selected.trim())) {
        throw httpError(400, 'Matcha alla alternativ i frågan eller hoppa över den.')
      }
    }
  } else if (
    !Number.isInteger(answer) ||
    !question.answers.some((option) => option.id === answer)
  ) {
    throw httpError(400, 'Välj ett av frågans svarsalternativ eller hoppa över frågan.')
  }
}

module.exports = { httpError, readJson, validateSubmission, validateAnswer }

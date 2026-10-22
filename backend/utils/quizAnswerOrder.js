const { createHash } = require('node:crypto')

function orderQuizAnswers(answers, quizId, questionId) {
  return answers
    .map((answer) => ({
      answer,
      sortKey: createHash('sha256').update(`${quizId}:${questionId}:${answer.id}`).digest('hex'),
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ answer }) => answer)
}

function orderMatchOptions(answers, quizId, questionId) {
  const ordered = answers
    .map((answer) => ({
      matchText: answer.match_text,
      sortKey: createHash('sha256')
        .update(`${quizId}:${questionId}:match:${answer.id}`)
        .digest('hex'),
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ matchText }) => matchText)
    .filter(Boolean)

  if (ordered.length > 1 && ordered.every((text, index) => text === answers[index]?.match_text)) {
    ordered.push(ordered.shift())
  }
  return ordered
}

module.exports = { orderQuizAnswers, orderMatchOptions }

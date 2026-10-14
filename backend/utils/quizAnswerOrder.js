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

module.exports = { orderQuizAnswers }

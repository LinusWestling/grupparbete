const { matchAcceptedAnswer } = require('../../../shared/freeTextGrading.mjs')

function evaluate(question, userResponse) {
  const acceptedAnswers = question.answers
    .filter((answer) => Boolean(answer.is_correct))
    .map((answer) => answer.answer_text)

  const isCorrect = matchAcceptedAnswer(userResponse, acceptedAnswers)

  return {
    question_id: question.id,
    is_correct: isCorrect,
    user_input: userResponse,
    correct_answer_text: acceptedAnswers.join(' / '),
    explanation: question.sources[0]?.source_text ?? null,
  }
}

module.exports = { evaluate }

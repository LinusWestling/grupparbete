function evaluate(question, userResponse) {
  const userInput = String(userResponse || '')
    .trim()
    .toLowerCase()
  const correctAnswer = question.answers.find((a) => Boolean(a.is_correct)) || question.answers[0]

  let isCorrect = false
  if (correctAnswer) {
    const expected = String(correctAnswer.answer_text).trim().toLowerCase()
    isCorrect = userInput.length > 0 && userInput === expected
  }

  return {
    question_id: question.id,
    is_correct: isCorrect,
    user_input: userResponse,
    correct_answer_text: correctAnswer ? correctAnswer.answer_text : '',
    explanation: question.sources.length > 0 ? question.sources[0].source_text : null,
  }
}

module.exports = { evaluate }

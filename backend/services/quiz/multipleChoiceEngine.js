function evaluate(question, userResponse) {
  const chosenAnswerId = Number(userResponse)
  const correctAnswer = question.answers.find((a) => Boolean(a.is_correct))
  const isCorrect = correctAnswer && correctAnswer.id === chosenAnswerId

  return {
    question_id: question.id,
    is_correct: Boolean(isCorrect),
    chosen_answer_id: chosenAnswerId,
    correct_answer_id: correctAnswer ? correctAnswer.id : null,
    correct_answer_text: correctAnswer ? correctAnswer.answer_text : '',
    explanation: question.sources.length > 0 ? question.sources[0].source_text : null,
  }
}

module.exports = { evaluate }

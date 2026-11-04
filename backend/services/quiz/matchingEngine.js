function evaluate(question, userResponse) {
  const responseMap =
    userResponse && typeof userResponse === 'object' && !Array.isArray(userResponse)
      ? userResponse
      : {}

  const pairs = Array.isArray(question.answers) ? question.answers : []
  const isCorrect =
    pairs.length > 0 &&
    pairs.every((pair) => {
      const selected = String(responseMap[pair.id] ?? responseMap[String(pair.id)] ?? '')
        .trim()
        .toLowerCase()
      const expected = String(pair.match_text ?? '')
        .trim()
        .toLowerCase()
      return selected.length > 0 && selected === expected
    })

  const selectedAnswerText = pairs
    .map((pair) => {
      const selected = responseMap[pair.id] ?? responseMap[String(pair.id)] ?? '—'
      return `${pair.answer_text} → ${selected}`
    })
    .join(' | ')

  const correctAnswerText = pairs
    .map((pair) => `${pair.answer_text} → ${pair.match_text}`)
    .join(' | ')

  return {
    question_id: question.id,
    is_correct: Boolean(isCorrect),
    user_input: responseMap,
    selected_answer_text: selectedAnswerText,
    correct_answer_text: correctAnswerText,
    explanation: question.sources.length > 0 ? question.sources[0].source_text : null,
  }
}

module.exports = { evaluate }

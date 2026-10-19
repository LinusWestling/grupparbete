// Keep these rules aligned with the backend quiz engines. These results are
// provisional; official grading and XP remain the backend's responsibility.
export function gradeQuizLocally(quiz, selectedAnswers) {
  const results = quiz.questions.map((question) => {
    const answer = selectedAnswers[question.id]
    const isSkipped = question.is_skipped || !question.is_answered
    const freeText = question.question_type === 'free_text'
    const correct =
      question.answers.find((option) => Boolean(option.is_correct)) ||
      (freeText ? question.answers[0] : null)
    const chosen = freeText ? null : question.answers.find((option) => option.id === Number(answer))
    const input = String(answer || '')
      .trim()
      .toLowerCase()
    const isCorrect =
      !isSkipped &&
      Boolean(correct) &&
      (freeText
        ? input.length > 0 && input === String(correct.answer_text).trim().toLowerCase()
        : correct.id === Number(answer))
    return {
      question_id: question.id,
      question_text: question.question_text,
      is_correct: isCorrect,
      is_skipped: isSkipped,
      chosen_answer_id: freeText || isSkipped ? null : Number(answer),
      user_input: freeText && !isSkipped ? answer : null,
      selected_answer_text: isSkipped
        ? null
        : freeText
          ? String(answer)
          : chosen?.answer_text || '',
      correct_answer_id: correct?.id ?? null,
      correct_answer_text: correct?.answer_text || '',
      explanation: question.sources[0]?.source_text ?? null,
      sources: question.sources,
    }
  })
  const correctCount = results.filter((result) => result.is_correct).length
  const percentage = results.length > 0 ? correctCount / results.length : 0
  return {
    quiz_id: quiz.quiz_id,
    total_questions: results.length,
    correct_count: correctCount,
    percentage: Math.round(percentage * 100),
    meets_80_percent: percentage >= 0.8,
    skipped_count: results.filter((result) => result.is_skipped).length,
    xp_earned: correctCount * 10 * quiz.difficulty,
    confirmation_status: 'pending',
    results,
  }
}

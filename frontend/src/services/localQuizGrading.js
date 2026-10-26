import { matchAcceptedAnswer } from '../../../shared/freeTextGrading.mjs'

// Keep these rules aligned with the backend quiz engines. These results are
// provisional; official grading and XP remain the backend's responsibility.
export function gradeQuizLocally(quiz, selectedAnswers) {
  const results = quiz.questions.map((question) => {
    const answer = selectedAnswers[question.id]
    const isSkipped = question.is_skipped || !question.is_answered
    const freeText = question.question_type === 'free_text'
    const isMatching = question.question_type === 'matching'

    if (isMatching) {
      const responseMap =
        answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {}
      const pairs = Array.isArray(question.answers) ? question.answers : []
      const isCorrect =
        !isSkipped &&
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

      return {
        question_id: question.id,
        question_text: question.question_text,
        is_correct: isCorrect,
        is_skipped: isSkipped,
        chosen_answer_id: null,
        user_input: !isSkipped ? responseMap : null,
        selected_answer_text: isSkipped
          ? null
          : pairs
              .map(
                (pair) =>
                  `${pair.answer_text} → ${responseMap[pair.id] ?? responseMap[String(pair.id)] ?? '—'}`,
              )
              .join(' | '),
        correct_answer_id: null,
        correct_answer_text: pairs
          .map((pair) => `${pair.answer_text} → ${pair.match_text}`)
          .join(' | '),
        explanation: question.sources[0]?.source_text ?? null,
        sources: question.sources,
      }
    }

    const correct =
      question.answers.find((option) => Boolean(option.is_correct)) ||
      (freeText ? question.answers[0] : null)
    const chosen = freeText ? null : question.answers.find((option) => option.id === Number(answer))
    const acceptedAnswers = question.answers
      .filter((option) => Boolean(option.is_correct))
      .map((option) => option.answer_text)
    const isCorrect =
      !isSkipped &&
      Boolean(correct) &&
      (freeText
        ? matchAcceptedAnswer(answer, acceptedAnswers, {
            allowTypos: question.allow_typos === true || question.allow_typos === 1,
          })
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
      correct_answer_text: freeText ? acceptedAnswers.join(' / ') : correct?.answer_text || '',
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

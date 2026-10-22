// Version 1 offline contract. Answers intentionally include the answer key;
// sources contain explanations needed by the future local summary.
function quizPayload(quiz, questions) {
  return {
    ...quiz,
    payload_version: 1,
    quiz_id: quiz.quiz_id ?? quiz.id,
    total_questions: questions.length,
    questions: questions.map((question) => ({
      ...question,
      answers: question.answers.map((answer) => ({
        ...answer,
        is_correct: Boolean(answer.is_correct),
      })),
      sources: question.sources || [],
      is_answered: Boolean(question.is_answered),
      is_skipped: Boolean(question.is_skipped),
      chosen_answer_id: question.chosen_answer_id ?? null,
      free_text_answer: question.free_text_answer ?? null,
      submitted_answer: question.submitted_answer ?? null,
    })),
  }
}

module.exports = quizPayload

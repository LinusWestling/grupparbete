import { computed, ref } from 'vue'
import { gradeQuizLocally } from '../services/localQuizGrading.js'

export function createQuizStore(
  saveProgress = async (...args) => {
    const { api } = await import('../services/api.js')
    return api.saveQuestionProgress(...args)
  },
  submitQuiz = async (...args) => {
    const { api } = await import('../services/api.js')
    return api.submitQuizSession(...args)
  },
) {
  const activeQuizSession = ref(null)
  const currentQuestionIndex = ref(0)
  const selectedAnswers = ref({})
  const quizResult = ref(null)
  const pendingChanges = ref({})
  const confirmedProgress = ref({})
  const saving = ref(false)
  const pendingCompletion = ref(false)
  const syncingCompletion = ref(false)
  let revision = 0
  let flushPromise = null
  const saveMessage = computed(() =>
    Object.keys(pendingChanges.value).length
      ? saving.value
        ? 'Saved in this tab — syncing…'
        : 'Saved in this tab — waiting to sync. Keep this tab open.'
      : 'Saved to your account',
  )

  function loadQuiz(payload) {
    if (pendingCompletion.value || Object.keys(pendingChanges.value).length || saving.value) {
      throw new Error('Save the current quiz progress before replacing it')
    }
    if (
      payload.payload_version !== 1 ||
      !Array.isArray(payload.questions) ||
      !payload.questions.length ||
      !payload.questions.every(
        (q) =>
          Array.isArray(q.answers) &&
          Array.isArray(q.sources) &&
          q.answers.every((a) => typeof a.is_correct === 'boolean'),
      )
    )
      throw new Error('The complete offline quiz could not be loaded')
    selectedAnswers.value = {}
    confirmedProgress.value = {}
    pendingChanges.value = {}
    quizResult.value = null
    for (const question of payload.questions) {
      if (question.is_answered) {
        selectedAnswers.value[question.id] = question.free_text_answer ?? question.chosen_answer_id
      }
      confirmedProgress.value[question.id] = {
        answer: selectedAnswers.value[question.id],
        isSkipped: question.is_skipped,
      }
    }
    const first = payload.questions.findIndex((q) => !q.is_answered && !q.is_skipped)
    currentQuestionIndex.value = first < 0 ? 0 : first
    activeQuizSession.value = payload
  }

  function recordProgress(questionId, answer, isSkipped = false) {
    const question = activeQuizSession.value?.questions.find((q) => q.id === questionId)
    if (!question || pendingCompletion.value || quizResult.value) return
    if (isSkipped) delete selectedAnswers.value[questionId]
    else selectedAnswers.value[questionId] = answer
    question.is_answered = !isSkipped && answer !== undefined && String(answer).trim() !== ''
    question.is_skipped = isSkipped
    question.chosen_answer_id =
      question.question_type === 'free_text' || !question.is_answered ? null : answer
    question.free_text_answer =
      question.question_type === 'free_text' && question.is_answered ? answer : null
    pendingChanges.value[questionId] = { answer, isSkipped, revision: ++revision }
  }

  // Serialize writes and only acknowledge the revision actually sent. Editing
  // while a request is running must never clear or overwrite newer local data.
  function flushPending() {
    if (flushPromise) return flushPromise
    const quizId = activeQuizSession.value?.quiz_id
    if (!quizId) return Promise.resolve(false)
    flushPromise = (async () => {
      saving.value = true
      try {
        while (Object.keys(pendingChanges.value).length) {
          // Empty free-text drafts stay local until answered or explicitly skipped.
          const next = Object.entries(pendingChanges.value).find(
            ([, change]) =>
              change.isSkipped ||
              (change.answer !== undefined && String(change.answer).trim() !== ''),
          )
          if (!next) return false
          const [questionId, change] = next
          await saveProgress(quizId, Number(questionId), {
            answer: change.answer,
            isSkipped: change.isSkipped,
          })
          confirmedProgress.value[questionId] = {
            answer: change.answer,
            isSkipped: change.isSkipped,
          }
          if (pendingChanges.value[questionId]?.revision === change.revision) {
            delete pendingChanges.value[questionId]
          }
        }
        return true
      } catch {
        return false
      } finally {
        saving.value = false
      }
    })().finally(() => {
      flushPromise = null
    })
    return flushPromise
  }

  function clearQuiz() {
    if (
      pendingCompletion.value ||
      syncingCompletion.value ||
      saving.value ||
      Object.keys(pendingChanges.value).length
    )
      return false
    activeQuizSession.value = null
    quizResult.value = null
    selectedAnswers.value = {}
    confirmedProgress.value = {}
    return true
  }

  function completeLocally() {
    const quiz = activeQuizSession.value
    if (!quiz || quizResult.value) return
    // Unanswered questions are explicitly skipped in the final local result.
    for (const question of quiz.questions) {
      if (!question.is_answered && !question.is_skipped)
        recordProgress(question.id, undefined, true)
    }
    quizResult.value = gradeQuizLocally(quiz, selectedAnswers.value)
    quiz.status = 'completed_locally'
    pendingCompletion.value = true
  }

  async function syncCompletion() {
    if (!pendingCompletion.value || syncingCompletion.value) return false
    syncingCompletion.value = true
    try {
      if (!(await flushPending())) return false
      const confirmed = await submitQuiz(activeQuizSession.value.quiz_id)
      const localResults = quizResult.value.results
      quizResult.value = {
        ...quizResult.value,
        ...confirmed,
        confirmation_status: 'confirmed',
        // Preserve skipped entries and question/selected-answer text that the
        // existing submit endpoint does not include in its grading response.
        results: localResults.map((local) => ({
          ...local,
          ...confirmed.results.find((result) => result.question_id === local.question_id),
        })),
      }
      activeQuizSession.value.status = 'completed'
      pendingCompletion.value = false
      return true
    } catch {
      return false
    } finally {
      syncingCompletion.value = false
    }
  }

  return {
    activeQuizSession,
    currentQuestionIndex,
    selectedAnswers,
    quizResult,
    pendingChanges,
    confirmedProgress,
    saving,
    saveMessage,
    loadQuiz,
    recordProgress,
    flushPending,
    clearQuiz,
    pendingCompletion,
    syncingCompletion,
    completeLocally,
    syncCompletion,
  }
}

export const quizStore = createQuizStore()

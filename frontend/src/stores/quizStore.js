import { computed, ref, watch } from 'vue'
import { gradeQuizLocally } from '../services/localQuizGrading.js'
import { startQuizUnloadWarning } from '../services/quizNavigationSafety.js'

function browserStorage() {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

function snapshotTabId() {
  const freshId = globalThis.crypto.randomUUID()
  try {
    const key = 'skillswap:quiz-tab'
    const previousId = globalThis.sessionStorage.getItem(key)
    return { id: freshId, previousId }
  } catch {
    return { id: freshId, previousId: null }
  }
}

const tabSnapshot = snapshotTabId()

export function createQuizStore(
  saveProgress = async (...args) => {
    const { api } = await import('../services/api.js')
    return api.saveQuestionProgress(...args)
  },
  submitQuiz = async (...args) => {
    const { api } = await import('../services/api.js')
    return api.submitQuizSession(...args)
  },
  storage = browserStorage(),
  snapshotOwner = tabSnapshot.id,
) {
  let ownerId = null
  const locallySaved = ref(false)
  const activeQuizSession = ref(null)
  const currentQuestionIndex = ref(0)
  const selectedAnswers = ref({})
  const quizResult = ref(null)
  const pendingChanges = ref({})
  const confirmedProgress = ref({})
  const saving = ref(false)
  const pendingCompletion = ref(false)
  const syncingCompletion = ref(false)
  const syncError = ref(null)
  let revision = 0
  let flushPromise = null
  const hasUnsyncedData = computed(
    () => pendingCompletion.value || Object.keys(pendingChanges.value).length > 0,
  )
  const isSyncing = computed(() => saving.value || syncingCompletion.value)
  const syncState = computed(() =>
    isSyncing.value ? 'Syncing' : hasUnsyncedData.value ? 'Waiting to sync' : 'Saved',
  )
  const saveMessage = computed(() =>
    Object.keys(pendingChanges.value).length
      ? saving.value
        ? locallySaved.value
          ? 'Saved on this device — syncing…'
          : 'Saved in this tab — syncing…'
        : locallySaved.value
          ? 'Saved on this device — waiting to sync.'
          : 'Saved in this tab — waiting to sync. Keep this tab open.'
      : 'Saved to your account',
  )

  function loadQuiz(payload, userId = ownerId) {
    assertCanReplaceQuiz()
    ownerId = userId
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
    syncError.value = null
    revision = Math.max(0, ...payload.questions.map((question) => question.progress_revision || 0))
    for (const question of payload.questions) {
      if (question.is_answered) {
        selectedAnswers.value[question.id] =
          question.question_type === 'matching'
            ? { ...(question.submitted_answer || {}) }
            : (question.free_text_answer ?? question.chosen_answer_id)
      } else if (question.question_type === 'matching') {
        selectedAnswers.value[question.id] = {}
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

  // Persist synchronously: shutdown must not depend on a timer or network request.
  watch(
    [
      activeQuizSession,
      currentQuestionIndex,
      selectedAnswers,
      pendingChanges,
      confirmedProgress,
      quizResult,
      pendingCompletion,
    ],
    () => {
      locallySaved.value = false
      if (!ownerId || !storage) return
      try {
        const key = `skillswap:quiz:${ownerId}:${snapshotOwner}`
        // A tombstone prevents reload from reviving an older shared snapshot.
        if (!activeQuizSession.value)
          storage.setItem(key, JSON.stringify({ version: 1, quiz: null }))
        else
          storage.setItem(
            key,
            JSON.stringify({
              version: 1,
              quiz: activeQuizSession.value,
              index: currentQuestionIndex.value,
              answers: selectedAnswers.value,
              pending: pendingChanges.value,
              confirmed: confirmedProgress.value,
              result: quizResult.value,
              completion: pendingCompletion.value,
              revision,
            }),
          )
        locallySaved.value = Boolean(activeQuizSession.value)
        if (snapshotOwner === tabSnapshot.id) {
          try {
            globalThis.sessionStorage.setItem('skillswap:quiz-tab', snapshotOwner)
          } catch {
            // The snapshot is saved even if reload discovery is unavailable.
          }
        }
      } catch {
        // Storage can be unavailable or full; retain the existing unload warning.
      }
    },
    { deep: true, flush: 'sync' },
  )

  function restoreQuiz(userId) {
    if (!userId || activeQuizSession.value || !storage) return false
    try {
      const saved = JSON.parse(
        storage.getItem(`skillswap:quiz:${userId}:${snapshotOwner}`) ||
          (snapshotOwner === tabSnapshot.id &&
            tabSnapshot.previousId &&
            storage.getItem(`skillswap:quiz:${userId}:${tabSnapshot.previousId}`)) ||
          storage.getItem(`skillswap:quiz:${userId}`),
      )
      if (!saved || saved.version !== 1 || !saved.quiz?.questions?.length) return false
      // Keep persistence disabled until the entire snapshot has been restored.
      loadQuiz(saved.quiz, null)
      currentQuestionIndex.value = Math.max(
        0,
        Math.min(saved.index || 0, saved.quiz.questions.length - 1),
      )
      selectedAnswers.value = saved.answers || {}
      pendingChanges.value = saved.pending || {}
      confirmedProgress.value = saved.confirmed || {}
      quizResult.value = saved.result || null
      pendingCompletion.value = Boolean(saved.completion)
      revision = Math.max(revision, saved.revision || 0)
      ownerId = userId
      // Copy legacy/shared snapshots into this tab's ownership before editing.
      // Never remove the shared copy: another tab may still depend on it.
      activeQuizSession.value = { ...activeQuizSession.value }
      return true
    } catch {
      return false
    }
  }

  function assertCanReplaceQuiz() {
    if (hasUnsyncedData.value || isSyncing.value) {
      throw new Error(
        'Your current quiz has unsaved data. Keep this tab open and finish saving before starting another quiz.',
      )
    }
  }

  function isAnswerComplete(question, answer) {
    if (!question || answer === undefined || answer === null) return false
    if (question.question_type === 'matching') {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false
      return (
        question.answers.length > 0 &&
        question.answers.every((opt) => {
          const val = answer[opt.id] ?? answer[String(opt.id)]
          return typeof val === 'string' && val.trim() !== ''
        })
      )
    }
    return String(answer).trim() !== ''
  }

  function recordProgress(questionId, answer, isSkipped = false) {
    const question = activeQuizSession.value?.questions.find((q) => q.id === questionId)
    if (!question || pendingCompletion.value || quizResult.value) return
    const isMatching = question.question_type === 'matching'
    if (
      question.is_skipped === isSkipped &&
      (isSkipped || (!isMatching && selectedAnswers.value[questionId] === answer))
    )
      return
    if (isSkipped) {
      if (isMatching) selectedAnswers.value[questionId] = {}
      else delete selectedAnswers.value[questionId]
    } else {
      selectedAnswers.value[questionId] = isMatching && answer ? { ...answer } : answer
    }
    const complete = !isSkipped && isAnswerComplete(question, selectedAnswers.value[questionId])
    question.is_answered = complete
    question.is_skipped = isSkipped
    question.chosen_answer_id =
      question.question_type === 'free_text' || isMatching || !complete ? null : answer
    question.free_text_answer = question.question_type === 'free_text' && complete ? answer : null
    question.submitted_answer = complete ? selectedAnswers.value[questionId] : null
    pendingChanges.value[questionId] = {
      answer: selectedAnswers.value[questionId],
      isSkipped,
      isComplete: complete,
      revision: ++revision,
    }
  }

  // Serialize writes and only acknowledge the revision actually sent. Editing
  // while a request is running must never clear or overwrite newer local data.
  function flushPending() {
    if (pendingCompletion.value || syncingCompletion.value) return Promise.resolve(false)
    if (flushPromise) return flushPromise
    const quizId = activeQuizSession.value?.quiz_id
    if (!quizId) return Promise.resolve(false)
    flushPromise = (async () => {
      saving.value = true
      try {
        while (Object.keys(pendingChanges.value).length) {
          if (pendingCompletion.value) return false
          // Empty free-text or incomplete matching drafts stay local until complete or skipped.
          const next = Object.entries(pendingChanges.value).find(
            ([, change]) => change.isSkipped || change.isComplete,
          )
          if (!next) return false
          const [questionId, change] = next
          await saveProgress(quizId, Number(questionId), {
            answer: change.isSkipped ? null : change.answer,
            isSkipped: change.isSkipped,
            revision: change.revision,
          })
          syncError.value = null
          confirmedProgress.value[questionId] = {
            answer: change.answer,
            isSkipped: change.isSkipped,
          }
          if (pendingChanges.value[questionId]?.revision === change.revision) {
            delete pendingChanges.value[questionId]
          }
        }
        return true
      } catch (error) {
        syncError.value = { status: error.status, message: error.message }
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
    for (const [questionId, change] of Object.entries(pendingChanges.value)) {
      if (!change.isSkipped && !change.isComplete) {
        delete pendingChanges.value[questionId]
      }
    }
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
      // Finish any in-flight progress write, then send the complete local state
      // in one transaction. Do not discard pending changes before confirmation.
      if (flushPromise) await flushPromise
      const submissions = activeQuizSession.value.questions.map((question) => ({
        question_id: question.id,
        answer: question.is_skipped ? null : selectedAnswers.value[question.id],
        isSkipped: question.is_skipped,
      }))
      const confirmed = await submitQuiz(activeQuizSession.value.quiz_id, submissions)
      // Preserve local result fields in case server response is incomplete
      quizResult.value = {
        ...quizResult.value,
        ...confirmed,
        confirmation_status: 'confirmed',
      }
      activeQuizSession.value.status = 'completed'
      pendingCompletion.value = false
      pendingChanges.value = {}
      confirmedProgress.value = Object.fromEntries(
        submissions.map((item) => [
          item.question_id,
          { answer: item.answer, isSkipped: item.isSkipped },
        ]),
      )
      syncError.value = null
      return true
    } catch (error) {
      syncError.value = { status: error.status, message: error.message }
      return false
    } finally {
      syncingCompletion.value = false
    }
  }

  function startAutoSync(target = globalThis.window) {
    if (!target) return () => {}
    let timer
    let stopped = false
    const hasPending = () => pendingCompletion.value || Object.keys(pendingChanges.value).length > 0
    const synchronize = async () => {
      if (stopped || !hasPending() || target.navigator?.onLine === false) return
      // Authentication and validation need user intervention; avoid polling
      // them continuously. Focus, reconnect, and manual retries try again.
      if ([400, 401, 403, 409].includes(syncError.value?.status)) return
      if (pendingCompletion.value) await syncCompletion()
      else await flushPending()
      if (hasPending()) schedule(15000)
    }
    const schedule = (delay = 350) => {
      clearTimeout(timer)
      if (!stopped && hasPending()) timer = setTimeout(synchronize, delay)
    }
    const reconnect = () => {
      syncError.value = null
      schedule(0)
    }
    const stopWatching = watch([pendingChanges, pendingCompletion], () => schedule(), {
      deep: true,
    })
    target.addEventListener('online', reconnect)
    target.addEventListener('focus', reconnect)
    target.addEventListener('quiz-auth-restored', reconnect)
    schedule()
    return () => {
      stopped = true
      clearTimeout(timer)
      stopWatching()
      target.removeEventListener('online', reconnect)
      target.removeEventListener('focus', reconnect)
      target.removeEventListener('quiz-auth-restored', reconnect)
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
    locallySaved,
    restoreQuiz,
    loadQuiz,
    recordProgress,
    flushPending,
    clearQuiz,
    pendingCompletion,
    syncingCompletion,
    completeLocally,
    syncCompletion,
    syncError,
    startAutoSync,
    hasUnsyncedData,
    isSyncing,
    syncState,
    assertCanReplaceQuiz,
  }
}

export const quizStore = createQuizStore()
if (typeof window !== 'undefined') {
  const stopAutoSync = quizStore.startAutoSync(window)
  const stopUnloadWarning = startQuizUnloadWarning(quizStore, window)
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      stopAutoSync()
      stopUnloadWarning()
    })
}

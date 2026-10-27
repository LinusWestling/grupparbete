import { computed, effectScope, ref, watch } from 'vue'
import { gradeQuizLocally } from '../services/localQuizGrading.js'
import { startQuizUnloadWarning } from '../services/quizNavigationSafety.js'
import { currentUser, authResolved, authState, offlineAccountId } from '../services/auth.js'

export function createQuizStore(
  saveProgress = async (...args) => {
    const { api } = await import('../services/api.js')
    return api.saveQuestionProgress(...args)
  },
  submitQuiz = async (...args) => {
    const { api } = await import('../services/api.js')
    return api.submitQuizSession(...args)
  },
  storage = undefined,
) {
  const storageKey = 'skillswap.quiz.v1'
  // Each page owns its entry, including when two tabs edit the same attempt.
  const writerId = globalThis.crypto.randomUUID()
  let entryKey = null
  let ancestors = []
  let savedAt = 0
  let hasAccountEntries = false
  function hasValidEntryMetadata(saved) {
    return (
      saved?.version === 1 &&
      (saved.ancestors === undefined ||
        (Array.isArray(saved.ancestors) &&
          saved.ancestors.every((key) => typeof key === 'string'))) &&
      (saved.savedAt === undefined || (Number.isFinite(saved.savedAt) && saved.savedAt >= 0))
    )
  }
  function isValidQuizEntry(saved) {
    return (
      hasValidEntryMetadata(saved) &&
      saved.activeQuizSession?.payload_version === 1 &&
      Array.isArray(saved.activeQuizSession.questions) &&
      saved.activeQuizSession.questions.length > 0 &&
      Number.isSafeInteger(saved.revision) &&
      saved.revision >= 0 &&
      Number.isInteger(saved.currentQuestionIndex) &&
      saved.currentQuestionIndex >= 0 &&
      saved.currentQuestionIndex < saved.activeQuizSession.questions.length &&
      typeof saved.pendingCompletion === 'boolean' &&
      ['selectedAnswers', 'pendingChanges', 'confirmedProgress'].every(
        (key) => saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key]),
      ) &&
      saved.activeQuizSession.questions.every(
        (q) => q && Array.isArray(q.answers) && Array.isArray(q.sources),
      )
    )
  }
  function readEntries() {
    const entries = []
    hasAccountEntries = false
    try {
      for (let index = 0; index < (storage?.length ?? 0); index++) {
        const key = storage.key(index)
        if (!key?.startsWith(`${storageKey}:`)) continue
        try {
          const value = JSON.parse(storage.getItem(key))
          if (value?.accountId === accountId && hasValidEntryMetadata(value)) {
            hasAccountEntries = true
            // Cleared entries still supersede their ancestors, but malformed
            // active quizzes must never hide valid entries or reach either restore path.
            if (value.activeQuizSession === null || isValidQuizEntry(value))
              entries.push({ key, value })
          }
        } catch {
          // A malformed entry must not prevent other quizzes from being recovered.
        }
      }
    } catch {
      persistenceError.value = 'Could not read saved quizzes on this device.'
      return []
    }
    const superseded = new Set(entries.flatMap(({ value }) => value.ancestors || []))
    return entries.filter(({ key, value }) => !superseded.has(key) && value.activeQuizSession)
  }
  try {
    storage ??= globalThis.window?.localStorage
  } catch {
    storage = null
  }
  const persistenceError = ref(null)
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
  let accountId = null
  let accountGeneration = 0
  let restoring = false
  const persistedState = {
    activeQuizSession,
    currentQuestionIndex,
    selectedAnswers,
    quizResult,
    pendingChanges,
    confirmedProgress,
    pendingCompletion,
  }
  function restoreAccount() {
    const resolvedAccountId =
      currentUser.value?.id ?? (authState.value === 'unavailable' ? offlineAccountId.value : null)
    // A failed lookup is not proof of sign-out. Preserve the current quiz and
    // stored entries when there is no remembered account to restore safely.
    if (
      authState.value === 'unavailable' &&
      (resolvedAccountId === null || resolvedAccountId === accountId)
    )
      return
    restoring = true
    const previousAccountId = accountId
    accountId = resolvedAccountId
    accountGeneration++
    activeQuizSession.value = null
    currentQuestionIndex.value = 0
    selectedAnswers.value = {}
    quizResult.value = null
    pendingChanges.value = {}
    confirmedProgress.value = {}
    pendingCompletion.value = false
    syncError.value = null
    revision = 0
    entryKey = null
    ancestors = []
    try {
      if (accountId === null || (previousAccountId !== null && previousAccountId !== accountId)) {
        if (authState.value === 'signed-out') storage?.removeItem(storageKey)
        const prefix = `${storageKey}:${previousAccountId}:`
        const keys = []
        for (let index = 0; index < (storage?.length ?? 0); index++) {
          const key = storage.key(index)
          if (previousAccountId !== null && key?.startsWith(prefix)) keys.push(key)
        }
        for (const key of keys) storage.removeItem(key)
        return
      }
      const candidates = readEntries().sort((a, b) => {
        const pending = (value) =>
          value.pendingCompletion || Object.keys(value.pendingChanges || {}).length > 0
        return (
          Number(pending(b.value)) - Number(pending(a.value)) || b.value.savedAt - a.value.savedAt
        )
      })
      const candidate = candidates[0]
      const raw = candidate
        ? JSON.stringify(candidate.value)
        : !hasAccountEntries
          ? storage?.getItem(storageKey)
          : null
      if (raw) {
        const saved = JSON.parse(raw)
        if (accountId === null || saved.accountId !== accountId) {
          if (authState.value === 'signed-out') storage.removeItem(storageKey)
          return
        }
        if (!isValidQuizEntry(saved)) throw new Error('Invalid saved quiz')
        for (const [key, state] of Object.entries(persistedState)) state.value = saved[key]
        revision = saved.revision
        ancestors = candidate ? [...(saved.ancestors || []), candidate.key] : []
        savedAt = saved.savedAt || 0
        entryKey = `${storageKey}:${accountId}:${saved.activeQuizSession.quiz_id}:${writerId}`
      }
    } catch {
      persistenceError.value = 'Could not restore the saved quiz on this device.'
    } finally {
      restoring = false
      if (activeQuizSession.value) {
        persist()
      }
    }
  }
  watch(
    [authResolved, () => currentUser.value?.id ?? null],
    ([resolved]) => {
      if (resolved) restoreAccount()
    },
    { immediate: true, flush: 'sync' },
  )
  function persist() {
    if (restoring || !authResolved.value) return
    try {
      if (!storage) throw new Error('Local storage unavailable')
      if (accountId === null || !entryKey) return
      savedAt = Math.max(Date.now(), savedAt + 1)
      storage.setItem(
        entryKey,
        JSON.stringify({
          version: 1,
          accountId,
          ancestors,
          savedAt,
          revision,
          ...Object.fromEntries(
            Object.entries(persistedState).map(([key, state]) => [key, state.value]),
          ),
        }),
      )
      persistenceError.value = null
    } catch {
      persistenceError.value =
        'Could not save on this device. Keep this tab open until your progress is saved to your account.'
    }
  }
  // Save before navigation or shutdown, without waiting for a timer or the network.
  watch(Object.values(persistedState), persist, { deep: true, flush: 'sync' })
  const hasUnsyncedData = computed(
    () => pendingCompletion.value || Object.keys(pendingChanges.value).length > 0,
  )
  const isSyncing = computed(() => saving.value || syncingCompletion.value)
  const syncState = computed(() =>
    isSyncing.value ? 'Syncing' : hasUnsyncedData.value ? 'Waiting to sync' : 'Saved',
  )
  const saveMessage = computed(() =>
    persistenceError.value && hasUnsyncedData.value
      ? 'Saved in this tab only — device storage unavailable'
      : Object.keys(pendingChanges.value).length
        ? saving.value
          ? 'Saved on this device — syncing…'
          : 'Saved on this device — waiting to sync.'
        : 'Saved to your account',
  )

  function loadQuiz(payload) {
    if (!authResolved.value || accountId === null) throw new Error('Sign in before loading a quiz')
    assertCanReplaceQuiz()
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
    restoring = true
    entryKey = `${storageKey}:${accountId}:${payload.quiz_id}:${writerId}`
    ancestors = []
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
    restoring = false
    persist()
  }

  function assertCanReplaceQuiz() {
    if (hasUnsyncedData.value || isSyncing.value) {
      throw new Error(
        'Your current quiz has pending saves. Sync it to your account before starting another quiz.',
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
    const generation = accountGeneration
    flushPromise = (async () => {
      saving.value = true
      try {
        while (Object.keys(pendingChanges.value).length) {
          if (generation !== accountGeneration) return false
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
          if (generation !== accountGeneration) return false
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
        if (generation !== accountGeneration) return false
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
    const generation = accountGeneration
    try {
      // Finish any in-flight progress write, then send the complete local state
      // in one transaction. Do not discard pending changes before confirmation.
      if (flushPromise) await flushPromise
      if (generation !== accountGeneration) return false
      const submissions = activeQuizSession.value.questions.map((question) => ({
        question_id: question.id,
        answer: question.is_skipped ? null : selectedAnswers.value[question.id],
        isSkipped: question.is_skipped,
      }))
      const confirmed = await submitQuiz(activeQuizSession.value.quiz_id, submissions)
      if (generation !== accountGeneration) return false
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
      if (generation !== accountGeneration) return false
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
    // Local persistence is immediate; sync after two seconds without changes.
    const schedule = (delay = 2000) => {
      clearTimeout(timer)
      if (!stopped && hasPending()) timer = setTimeout(synchronize, delay)
    }
    const reconnect = () => {
      syncError.value = null
      schedule(0)
    }
    const reconcile = (event) => {
      if (
        event.storageArea !== storage ||
        (event.key !== null && !event.key.startsWith(`${storageKey}:`))
      )
        return
      // Never replace pending work, including a conflicting edit of the same quiz.
      // Branch entries preserve both versions without last-writer-wins data loss.
      if (hasPending() || isSyncing.value) {
        if (event.key === entryKey && event.newValue === null) persist()
        return
      }
      const quizId = activeQuizSession.value?.quiz_id
      if (!quizId) return
      const newer = readEntries().find(
        ({ value }) =>
          value.activeQuizSession.quiz_id === quizId &&
          value.savedAt > savedAt &&
          !value.pendingCompletion &&
          !Object.keys(value.pendingChanges || {}).length,
      )
      if (!newer) return
      restoring = true
      for (const [key, state] of Object.entries(persistedState)) state.value = newer.value[key]
      revision = newer.value.revision
      savedAt = newer.value.savedAt
      ancestors = [...(newer.value.ancestors || []), newer.key]
      restoring = false
    }
    const stopWatching = watch([pendingChanges, pendingCompletion], () => schedule(), {
      deep: true,
    })
    target.addEventListener('online', reconnect)
    target.addEventListener('focus', reconnect)
    target.addEventListener('quiz-auth-restored', reconnect)
    target.addEventListener('storage', reconcile)
    schedule()
    return () => {
      stopped = true
      clearTimeout(timer)
      stopWatching()
      target.removeEventListener('online', reconnect)
      target.removeEventListener('focus', reconnect)
      target.removeEventListener('quiz-auth-restored', reconnect)
      target.removeEventListener('storage', reconcile)
    }
  }

  return {
    persistenceError,
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
    syncError,
    startAutoSync,
    hasUnsyncedData,
    isSyncing,
    syncState,
    assertCanReplaceQuiz,
  }
}

// The singleton survives route changes; dispose its auth/persistence watchers on hot reload.
const storeScope = effectScope()
export const quizStore = storeScope.run(() => createQuizStore())
if (typeof window !== 'undefined') {
  const stopAutoSync = quizStore.startAutoSync(window)
  const stopUnloadWarning = startQuizUnloadWarning(quizStore, window)
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      stopAutoSync()
      stopUnloadWarning()
      storeScope.stop()
    })
}

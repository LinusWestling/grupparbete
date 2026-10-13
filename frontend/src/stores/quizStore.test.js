import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createQuizStore } from './quizStore.js'

const payload = () => ({
  payload_version: 1,
  quiz_id: 7,
  difficulty: 1,
  questions: [1, 2].map((id) => ({
    id,
    question_type: 'multiple_choice',
    answers: [{ id: 10, is_correct: true }],
    sources: [],
    is_answered: false,
    is_skipped: false,
  })),
})

test('failed saves retain local answers and skips independently of confirmed progress', async () => {
  const store = createQuizStore(async () => {
    throw new Error('offline')
  })
  store.loadQuiz(payload())
  store.recordProgress(1, 10)
  store.recordProgress(2, undefined, true)
  assert.equal(await store.flushPending(), false)
  assert.equal(store.activeQuizSession.value.questions[0].is_answered, true)
  assert.equal(store.activeQuizSession.value.questions[1].is_skipped, true)
  assert.equal(store.selectedAnswers.value[1], 10)
  assert.equal(store.confirmedProgress.value[1].answer, undefined)
  assert.equal(Object.keys(store.pendingChanges.value).length, 2)
  assert.equal(store.clearQuiz(), false)
})

test('an old save response cannot discard a newer answer', async () => {
  let release
  const calls = []
  const store = createQuizStore(async (...args) => {
    calls.push(args)
    if (calls.length === 1)
      await new Promise((resolve) => {
        release = resolve
      })
  })
  store.loadQuiz(payload())
  store.recordProgress(1, 10)
  const saving = store.flushPending()
  store.recordProgress(1, 11)
  release()
  assert.equal(await saving, true)
  assert.deepEqual(
    calls.map((call) => call[2].answer),
    [10, 11],
  )
  assert.equal(store.selectedAnswers.value[1], 11)
  assert.equal(store.confirmedProgress.value[1].answer, 11)
  assert.equal(Object.keys(store.pendingChanges.value).length, 0)
})

test('resuming initializes confirmed answers and skips and rejects incomplete payloads', () => {
  const store = createQuizStore()
  const quiz = payload()
  quiz.questions[0].is_answered = true
  quiz.questions[0].chosen_answer_id = 10
  store.loadQuiz(quiz)
  assert.equal(store.selectedAnswers.value[1], 10)
  assert.equal(store.currentQuestionIndex.value, 1)
  assert.equal(Object.keys(store.pendingChanges.value).length, 0)
  assert.throws(() => store.loadQuiz({ ...quiz, payload_version: 0 }))
})

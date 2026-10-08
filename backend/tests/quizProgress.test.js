const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

function setup({ owner = 7, status = 'in_progress', failSave = false } = {}) {
  const quiz = { id: 1, user_id: owner, status, difficulty: 1, total_cnt: 2, topic_id: 1 }
  const questions = [
    {
      id: 10,
      question_type: 'multiple_choice',
      answers: [{ id: 100, is_correct: true }],
      sources: [],
    },
    {
      id: 20,
      question_type: 'free_text',
      answers: [{ id: 200, answer_text: 'Femur', is_correct: true }],
      sources: [],
    },
  ]
  const rows = questions.map((q) => ({
    question_id: q.id,
    is_answered: false,
    is_skipped: false,
    chosen_answer_id: null,
    free_text_answer: null,
  }))
  let snapshot
  let released = 0
  let historyCount = 0
  const connection = {
    async beginTransaction() {
      snapshot = JSON.parse(JSON.stringify({ quiz, rows }))
    },
    async commit() {},
    async rollback() {
      Object.assign(quiz, snapshot.quiz)
      rows.forEach((row, i) => Object.assign(row, snapshot.rows[i]))
    },
    release() {
      released++
    },
    async query(sql, params) {
      if (sql.includes('FROM quizzes')) return [[quiz]]
      if (sql.includes('FROM quiz_questions'))
        return [params.length === 2 ? rows.filter((r) => r.question_id === params[1]) : rows]
      throw new Error(`Unexpected query: ${sql}`)
    },
    async execute(sql, params) {
      if (sql.includes('UPDATE quiz_questions')) {
        if (failSave) throw new Error('Connection lost')
        const row = rows.find((r) => r.question_id === params.at(-1))
        Object.assign(row, { chosen_answer_id: params[0], free_text_answer: params[1] })
        if (sql.includes('is_correct = NULL'))
          Object.assign(row, { is_answered: params[2], is_skipped: params[3], is_correct: null })
        else Object.assign(row, { is_correct: params[2], is_answered: true, is_skipped: false })
      } else if (sql.includes('UPDATE quizzes'))
        Object.assign(quiz, { status: 'completed', total_score: params[0], correct_cnt: params[1] })
      else if (sql.includes('INSERT INTO user_answers')) historyCount++
      return [{}]
    },
  }
  const pool = {
    getConnection: async () => connection,
    async query(sql) {
      if (sql.includes('FROM quizzes')) return [[{ ...quiz }]]
      return [rows.map((row) => ({ ...row }))]
    },
  }
  const questionService = {
    getQuestionById: async (id, options = {}) => {
      const q = questions.find((q) => q.id === id)
      if (!q) return null
      return {
        ...q,
        answers: q.answers.map((a) =>
          options.includeCorrect ? { ...a } : { id: a.id, answer_text: a.answer_text },
        ),
      }
    },
    getQuestionForEvaluation: async (id) => questions.find((q) => q.id === id),
  }
  const module = { exports: {} }
  const source = fs.readFileSync(path.join(__dirname, '../services/quiz/quizService.js'), 'utf8')
  vm.runInNewContext(source, {
    module,
    require(name) {
      if (name === '../../database/pool') return pool
      if (name === '../questionService') return questionService
      return require(path.join(__dirname, '../services/quiz', name))
    },
  })
  return {
    service: module.exports,
    rows,
    quiz,
    released: () => released,
    historyCount: () => historyCount,
  }
}

test('answer and skip are persisted independently; skipping clears the selected answer', async () => {
  const { service, rows } = setup()
  await service.saveQuestionProgress(1, 7, 10, { answer: 100 })
  assert.equal(rows[0].is_answered, true)
  assert.equal(rows[0].is_skipped, false)
  await service.saveQuestionProgress(1, 7, 10, { isSkipped: true })
  assert.equal(rows[0].is_answered, false)
  assert.equal(rows[0].is_skipped, true)
  assert.equal(rows[0].chosen_answer_id, null)
  assert.equal(rows[1].is_answered, false)
  assert.equal(rows[1].is_skipped, false)
})

test('saved answers survive a details reload without revealing correct choices', async () => {
  const { service } = setup()
  await service.saveQuestionProgress(1, 7, 20, { answer: 'Femur' })
  const details = await service.getQuizDetails(1, 7)
  assert.equal(details.questions[1].free_text_answer, 'Femur')
  assert.equal(details.questions[1].is_answered, true)
  assert.equal(details.questions[1].answers[0].is_correct, undefined)
})

test('wrong owner and completed sessions cannot change progress', async () => {
  await assert.rejects(setup().service.saveQuestionProgress(1, 8, 10, { answer: 100 }), {
    status: 403,
  })
  await assert.rejects(
    setup({ status: 'completed' }).service.saveQuestionProgress(1, 7, 10, { answer: 100 }),
    { status: 409 },
  )
})

test('invalid answer IDs, empty answers and questions outside the quiz are rejected', async () => {
  const { service } = setup()
  await assert.rejects(service.saveQuestionProgress(1, 7, 10, { answer: 200 }), { status: 400 })
  await assert.rejects(service.saveQuestionProgress(1, 7, 20, { answer: ' ' }), { status: 400 })
  await assert.rejects(service.saveQuestionProgress(1, 7, 999, { answer: 100 }), { status: 404 })
})

test('failed persistence rolls back progress and releases the connection', async () => {
  const context = setup({ failSave: true })
  await assert.rejects(
    context.service.saveQuestionProgress(1, 7, 10, { answer: 100 }),
    /Connection lost/,
  )
  assert.equal(context.rows[0].is_answered, false)
  assert.equal(context.released(), 1)
})

test('submission grades persisted answers only and completion prevents repeat XP', async () => {
  const { service, historyCount } = setup()
  await service.saveQuestionProgress(1, 7, 10, { answer: 100 })
  await service.saveQuestionProgress(1, 7, 20, { isSkipped: true })
  const result = await service.submitQuizSession(1, 7)
  assert.equal(result.correct_count, 1)
  assert.equal(result.xp_earned, 10)
  assert.equal(result.results.length, 1)
  assert.equal(historyCount(), 1)
  await assert.rejects(service.submitQuizSession(1, 7), /not in progress/)
})

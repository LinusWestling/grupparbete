const { test } = require('node:test')
const assert = require('node:assert/strict')

// Replace only database I/O; exercise the actual session creation and snapshot logic.
const calls = []
let approved = true
let failSnapshot = false
const connection = {
  beginTransaction: async () => calls.push('begin'),
  commit: async () => calls.push('commit'),
  rollback: async () => calls.push('rollback'),
  release: () => calls.push('release'),
  execute: async (sql, params) => {
    calls.push({ sql, params })
    if (sql.includes('prospect_access_requests')) return [approved ? [{ id: 7 }] : []]
    if (sql.includes('INSERT INTO quizzes')) return [{ insertId: 42 }]
    if (failSnapshot) throw new Error('Snapshot write failed')
    return [{}]
  },
}
function stub(modulePath, exports) {
  const filename = require.resolve(modulePath)
  require.cache[filename] = { id: filename, filename, loaded: true, exports }
}
stub('../database/pool', { getConnection: async () => connection })
stub('../repositories/quizRepository', { getLatestQuizQuestionIds: async () => [] })
stub('../services/questionService', {
  getQuestions: async () => [
    {
      id: 9,
      topic_id: 1,
      topic_name: 'Anatomy',
      question_type: 'yes_no',
      question_text: 'Example?',
      sources: [],
      answers: [{ id: 11, answer_text: 'Yes', is_correct: true }],
    },
  ],
})
const { startQuiz } = require('../services/quiz/quizService')

test('assigned session records candidate, organization and immutable question in one transaction', async () => {
  calls.length = 0
  const result = await startQuiz(7, 1, 2, 10, 3)
  const access = calls.find((c) => c.sql?.includes('prospect_access_requests'))
  assert.deepEqual(access.params, [7, 3])
  assert.match(access.sql, /is_public_prospect = TRUE/)
  assert.match(access.sql, /status = 'approved' FOR SHARE/)
  assert.deepEqual(
    calls.find((c) => c.sql?.includes('INSERT INTO quizzes')).params,
    [7, 1, 2, 1, 3],
  )
  const snapshot = calls.find((c) => c.sql?.includes('INSERT INTO quiz_questions'))
  assert.equal(JSON.parse(snapshot.params[3]).question_text, 'Example?')
  assert.equal(result.quiz_id, 42)
  assert.equal(result.total_questions, 1)
  assert.deepEqual(calls.slice(-2), ['commit', 'release'])
})

test('candidate without approval cannot receive an assigned session', async () => {
  calls.length = 0
  approved = false
  try {
    await assert.rejects(startQuiz(7, 1, 2, 10, 3), { status: 403 })
    assert.equal(
      calls.some((c) => c.sql?.includes('INSERT')),
      false,
    )
    assert.deepEqual(calls.slice(-2), ['rollback', 'release'])
  } finally {
    approved = true
  }
})

test('snapshot failure rolls back assignment and releases connection', async () => {
  calls.length = 0
  failSnapshot = true
  try {
    await assert.rejects(startQuiz(7, 1, 2, 10, 3), /Snapshot write failed/)
    assert.equal(calls.includes('commit'), false)
    assert.deepEqual(calls.slice(-2), ['rollback', 'release'])
  } finally {
    failSnapshot = false
  }
})

test('ordinary practice quizzes remain available without organization approval', async () => {
  calls.length = 0
  await startQuiz(7, 1, 2, 10)
  assert.equal(
    calls.some((c) => c.sql?.includes('prospect_access_requests')),
    false,
  )
  assert.equal(calls.find((c) => c.sql?.includes('INSERT INTO quizzes')).params[4], null)
})

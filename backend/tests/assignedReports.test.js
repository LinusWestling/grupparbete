const { test } = require('node:test')
const assert = require('node:assert/strict')
let allowed = false
let detailCalls = 0
function stub(modulePath, exports) {
  const filename = require.resolve(modulePath)
  require.cache[filename] = { id: filename, filename, loaded: true, exports }
}
stub('../database/pool', {
  execute: async (sql, params) => {
    assert.deepEqual(params, [42, 7, 3])
    assert.match(sql, /q.organization_id = \?/)
    assert.match(sql, /q.user_id = \?/)
    assert.match(sql, /q.status = 'completed'/)
    assert.match(sql, /par.status = 'approved'/)
    assert.match(sql, /u.is_public_prospect = TRUE/)
    return [allowed ? [{ id: 42 }] : []]
  },
})
stub('../services/quiz/quizService', {
  getQuizDetails: async (quizId, candidateId) => {
    detailCalls++
    assert.deepEqual([quizId, candidateId], [42, 7])
    return {
      quiz_id: 42,
      correct_cnt: 1,
      total_cnt: 2,
      questions: [
        { question_id: 9, is_correct: true },
        { question_id: 10, is_correct: false },
      ],
    }
  },
})
const router = require('../routes/organizationRoutes')
const handler = router.stack.find((layer) => layer.route?.path.endsWith('/tests/:quizId')).route
  .stack[1].handle
function response() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}
test('report is unavailable unless the ownership, completion and consent query succeeds', async () => {
  const res = response()
  await handler({ params: { id: '7', quizId: '42' }, session: { userId: 3 } }, res, (err) => {
    throw err
  })
  assert.equal(res.statusCode, 404)
  assert.equal(detailCalls, 0)
})
test('authorized report returns stored counts and individual question outcomes', async () => {
  allowed = true
  const res = response()
  await handler({ params: { id: '7', quizId: '42' }, session: { userId: 3 } }, res, (err) => {
    throw err
  })
  assert.equal(res.body.correct_cnt, 1)
  assert.equal(res.body.total_cnt, 2)
  assert.deepEqual(
    res.body.questions.map((q) => q.is_correct),
    [true, false],
  )
})
test('invalid report IDs are rejected before database access', async () => {
  const res = response()
  await handler({ params: { id: '-1', quizId: 'bad' }, session: { userId: 3 } }, res, (err) => {
    throw err
  })
  assert.equal(res.statusCode, 400)
})

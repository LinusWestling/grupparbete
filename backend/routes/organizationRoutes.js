const express = require('express')
const router = express.Router()
const organizationController = require('../controllers/organizationController')
const { requireOrganization } = require('../middleware/auth')
const quizService = require('../services/quiz/quizService')
const pool = require('../database/pool')

router.post(
  '/api/organization/prospects/:id/tests',
  requireOrganization,
  async (req, res, next) => {
    try {
      const candidateId = Number(req.params.id)
      const { topicId, difficulty = 1, limit = 10 } = req.body || {}
      if (
        ![candidateId, topicId, difficulty, limit].every(Number.isSafeInteger) ||
        candidateId < 1 ||
        topicId < 1 ||
        difficulty < 1 ||
        difficulty > 5 ||
        limit < 1 ||
        limit > 50
      ) {
        return res.status(400).json({
          message:
            'Ange en giltig kandidat, ett ämne, en svårighetsgrad (1–5) och ett antal frågor (1–50).',
        })
      }
      const quiz = await quizService.startQuiz(
        candidateId,
        topicId,
        difficulty,
        limit,
        req.session.userId,
      )
      res.status(201).json({
        quiz_id: quiz.quiz_id,
        difficulty: quiz.difficulty,
        total_questions: quiz.total_questions,
      })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/api/organization/prospects/:id/tests/:quizId',
  requireOrganization,
  async (req, res, next) => {
    try {
      const candidateId = Number(req.params.id)
      const quizId = Number(req.params.quizId)
      if (![candidateId, quizId].every((id) => Number.isSafeInteger(id) && id > 0)) {
        return res.status(400).json({ message: 'Ogiltigt kandidat- eller quiz-ID.' })
      }
      const [rows] = await pool.execute(
        `SELECT q.id FROM quizzes q JOIN users u ON u.id = q.user_id
       JOIN prospect_access_requests par ON par.candidate_id = u.id AND par.organization_id = q.organization_id
       WHERE q.id = ? AND q.user_id = ? AND q.organization_id = ?
       AND u.is_public_prospect = TRUE AND par.status = 'approved' AND q.status = 'completed'`,
        [quizId, candidateId, req.session.userId],
      )
      if (!rows.length)
        return res
          .status(404)
          .json({ message: 'Det slutförda tilldelade testet hittades inte eller kan inte visas.' })
      res.json(await quizService.getQuizDetails(quizId, candidateId))
    } catch (err) {
      next(err)
    }
  },
)

router.get('/api/organization/prospects', requireOrganization, organizationController.getProspects)
router.post(
  '/api/organization/prospects/:id/request-access',
  requireOrganization,
  organizationController.requestProspectAccess,
)
router.get(
  '/api/organization/prospects/:id',
  requireOrganization,
  organizationController.getProspectDetails,
)

module.exports = router

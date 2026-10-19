const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')
const organizationController = require('../controllers/organizationController')

// Mounted at /api/admin behind requireAdmin in app.js, so every route here is admin-only.
router.get('/questions', questionController.getAdminQuestions)
router.get('/questions/:id', questionController.getAdminQuestionById)
router.post('/questions', questionController.createQuestion)
router.put('/questions/:id', questionController.updateQuestion)
router.delete('/questions/:id', questionController.deleteQuestion)

router.get('/org-requests', organizationController.getOrganizationRequests)
router.put('/org-requests/:userId', organizationController.updateOrganizationRequestStatus)

module.exports = router

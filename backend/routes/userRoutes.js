const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

const { requireAuth } = require('../middleware/auth')

router.get('/api/dashboard/stats', userController.getDashboardStats)
router.get('/api/users/:userId/progress', requireAuth, userController.getUserProgress)
router.put('/api/users/me/privacy', requireAuth, userController.updateUserPrivacy)
router.get('/api/users/me/access-requests', requireAuth, userController.getAccessRequests)
router.put(
  '/api/users/me/access-requests/:requestId',
  requireAuth,
  userController.respondToAccessRequest,
)

module.exports = router

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

const { requireAuth } = require('../middleware/auth')

router.get('/api/dashboard/stats', userController.getDashboardStats)
router.get('/api/users/:userId/progress', userController.getUserProgress)
router.put('/api/users/me/privacy', requireAuth, userController.updateUserPrivacy)

module.exports = router

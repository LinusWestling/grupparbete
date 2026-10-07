const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/api/dashboard/stats', userController.getDashboardStats)
router.get('/api/users/:userId/progress', userController.getUserProgress)

module.exports = router

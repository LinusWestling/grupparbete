const userService = require('../services/userService')

async function getDashboardStats(req, res) {
  try {
    const stats = await userService.getDashboardStats()
    res.json({ status: 'success', data: stats })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function getUserProgress(req, res) {
  try {
    const sessionUserId = req.session?.userId
    if (!sessionUserId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }

    const requestedUserId = req.params.userId ? Number(req.params.userId) : sessionUserId
    if (requestedUserId !== sessionUserId) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' })
    }

    const progress = await userService.getUserProgress(requestedUserId)
    res.json({ status: 'success', data: progress })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = {
  getDashboardStats,
  getUserProgress,
}

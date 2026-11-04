const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { readMonitoringLog } = require('../services/monitoringService')
const router = express.Router()

router.get('/api/monitoring/events', requireAuth, async (req, res, next) => {
  // Every actual read must reach the server and record access, including refreshes.
  res.set('Cache-Control', 'no-store')
  try {
    const events = await readMonitoringLog(req.session.userId)
    res.json({ status: 'success', data: events })
  } catch (error) {
    next(error)
  }
})

module.exports = router

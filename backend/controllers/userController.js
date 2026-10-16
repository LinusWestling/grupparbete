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

async function updateUserPrivacy(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const { is_public_prospect } = req.body
    if (typeof is_public_prospect !== 'boolean') {
      return res
        .status(400)
        .json({ status: 'error', message: 'is_public_prospect must be boolean' })
    }
    const userRepository = require('../repositories/userRepository')
    await userRepository.updateUserPrivacy(userId, is_public_prospect)
    res.json({ status: 'success', message: 'Privacy setting updated' })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function getAccessRequests(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const userRepository = require('../repositories/userRepository')
    const requests = await userRepository.getCandidateAccessRequests(userId)
    res.json({ status: 'success', data: requests })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function respondToAccessRequest(req, res) {
  try {
    const userId = req.session?.userId
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const requestId = Number(req.params.requestId)
    const { status } = req.body || {}
    if (!Number.isInteger(requestId) || !['approved', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({
          status: 'error',
          message: 'Valid requestId and status (approved/rejected) required',
        })
    }
    const userRepository = require('../repositories/userRepository')
    const updated = await userRepository.updateCandidateAccessRequest(requestId, userId, status)
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Access request not found' })
    }
    res.json({ status: 'success', message: `Access request ${status}` })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = {
  getDashboardStats,
  getUserProgress,
  updateUserPrivacy,
  getAccessRequests,
  respondToAccessRequest,
}

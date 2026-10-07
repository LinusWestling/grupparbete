const userService = require('../services/userService');

async function getDashboardStats(req, res) {
  try {
    const stats = await userService.getDashboardStats();
    res.json({ status: 'success', data: stats });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getUserProgress(req, res) {
  try {
    const userId = req.params.userId || 1; // Default fallback to user 1 for demo
    const progress = await userService.getUserProgress(userId);
    res.json({ status: 'success', data: progress });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  getDashboardStats,
  getUserProgress,
};

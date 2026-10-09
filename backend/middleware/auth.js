const userRepository = require('../repositories/userRepository')

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  next()
}

// Reads the role from the database on every request, so a demoted admin
// loses access immediately instead of when the session expires.
async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  try {
    const user = await userRepository.findById(req.session.userId)
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' })
    }
    next()
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function requireOrganization(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  try {
    const user = await userRepository.findById(req.session.userId)
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    if (user.role !== 'organization' && user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Organization access required' })
    }
    next()
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = { requireAuth, requireAdmin, requireOrganization }

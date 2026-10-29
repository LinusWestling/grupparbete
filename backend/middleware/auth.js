const userRepository = require('../repositories/userRepository')

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Du måste vara inloggad.' })
  }
  next()
}

// Reads the role from the database on every request, so a demoted admin
// loses access immediately instead of when the session expires.
async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Du måste vara inloggad.' })
  }

  try {
    const user = await userRepository.findById(req.session.userId)
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Du måste vara inloggad.' })
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Administratörsbehörighet krävs.' })
    }
    next()
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Ett serverfel uppstod. Försök igen senare.' })
  }
}

async function requireOrganization(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ status: 'error', message: 'Du måste vara inloggad.' })
  }

  try {
    const user = await userRepository.findById(req.session.userId)
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Du måste vara inloggad.' })
    }
    if (user.role !== 'organization' && user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Organisationsbehörighet krävs.' })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Ett serverfel uppstod. Försök igen senare.' })
  }
}

module.exports = { requireAuth, requireAdmin, requireOrganization }

const organizationService = require('../services/organizationService')
const userRepository = require('../repositories/userRepository')

async function getProspects(req, res, next) {
  try {
    const prospects = await organizationService.getProspects(req.user, req.query)
    res.json(prospects)
  } catch (err) {
    next(err)
  }
}

async function requestProspectAccess(req, res, next) {
  try {
    const candidateId = Number(req.params.id)
    if (!Number.isInteger(candidateId)) {
      return res.status(400).json({ message: 'Ogiltigt kandidat-ID.' })
    }
    const result = await organizationService.requestProspectAccess(req.user.id, candidateId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

async function getProspectDetails(req, res, next) {
  try {
    const prospect = await organizationService.getProspectDetails(req.user, req.params.id)
    if (!prospect) {
      return res.status(404).json({ message: 'Kandidaten hittades inte.' })
    }
    res.json(prospect)
  } catch (err) {
    next(err)
  }
}

async function getOrganizationRequests(req, res, next) {
  try {
    const requests = await userRepository.getOrganizationRequests()
    res.json(requests)
  } catch (err) {
    next(err)
  }
}

async function updateOrganizationRequestStatus(req, res, next) {
  try {
    const targetUserId = Number(req.params.userId)
    const { action } = req.body || {}
    if (!Number.isInteger(targetUserId) || !['approve', 'reject'].includes(action)) {
      return res
        .status(400)
        .json({ message: 'Ange en giltig användare och välj att godkänna eller avslå ansökan.' })
    }
    const updated = await userRepository.updateOrganizationRequestStatus(targetUserId, action)
    if (!updated) {
      return res.status(404).json({ message: 'Användaren hittades inte eller kan inte ändras.' })
    }
    res.json({
      status: 'success',
      message: `Organisationsansökan har ${action === 'approve' ? 'godkänts' : 'avslagits'}.`,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProspects,
  requestProspectAccess,
  getProspectDetails,
  getOrganizationRequests,
  updateOrganizationRequestStatus,
}

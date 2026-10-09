const organizationService = require('../services/organizationService')

async function getProspects(req, res, next) {
  try {
    const prospects = await organizationService.getProspects(req.query)
    res.json(prospects)
  } catch (err) {
    next(err)
  }
}

async function getProspectDetails(req, res, next) {
  try {
    const prospect = await organizationService.getProspectDetails(req.params.id)
    if (!prospect) {
      return res.status(404).json({ message: 'Prospect not found' })
    }
    res.json(prospect)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProspects,
  getProspectDetails,
}

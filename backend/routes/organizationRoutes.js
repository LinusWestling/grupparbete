const express = require('express')
const router = express.Router()
const organizationController = require('../controllers/organizationController')
const { requireOrganization } = require('../middleware/auth')

router.get('/api/organization/prospects', requireOrganization, organizationController.getProspects)
router.get('/api/organization/prospects/:id', requireOrganization, organizationController.getProspectDetails)

module.exports = router

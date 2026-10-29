const router = require('express').Router()
const { rateLimit } = require('express-rate-limit')
const authController = require('../controllers/authController')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'För många försök. Försök igen om 15 minuter.',
  },
})

router.use((req, res, next) => {
  const changesData = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)

  if (changesData && req.get('origin') !== process.env.FRONTEND_ORIGIN) {
    return res.status(403).json({
      message: 'Anrop från den här adressen är inte tillåtna.',
    })
  }

  next()
})

router.post('/register', authLimiter, authController.register)
router.post('/login', authLimiter, authController.login)
router.get('/me', authController.me)
router.post('/logout', authController.logout)

module.exports = router

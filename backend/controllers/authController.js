const { promisify } = require('node:util')
const authService = require('../services/authService')

async function register(req, res) {
  const { username, email, password } = req.body || {}

  const user = await authService.register({
    username,
    email,
    password,
  })

  res.status(201).json({
    id: user.id,
    message: 'Kontot har skapats. Du kan nu logga in.',
  })
}

async function login(req, res) {
  const { email, password } = req.body || {}

  const user = await authService.login({
    email,
    password,
  })

  // Byt session-ID efter lyckan lösenkontroll.
  await promisify(req.session.regenerate).call(req.session)

  req.session.userId = user.id

  // Spara session innan svaret skickas.
  await promisify(req.session.save).call(req.session)

  res.json(user)
}

async function me(req, res) {
  const user = await authService.getCurrentUser(req.session.userId)

  res.json(user)
}

async function logout(req, res) {
  await promisify(req.session.destroy).call(req.session)

  res.clearCookie('skillswap.sid', { path: '/' })
  res.sendStatus(204)
}

module.exports = { register, login, me, logout }

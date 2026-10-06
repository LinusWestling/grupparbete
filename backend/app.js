require('dotenv').config()

const express = require('express')
const cors = require('cors')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 3000

// Parse JSON bodies
app.use(express.json())

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
)

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET saknas i .env')
}

app.use(
  session({
    name: 'skillswap.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
)

app.use('/api/auth', require('./routes/authRoutes'))
app.use(express.static('public'))

const bookRoutes = require('./routes/bookRoutes')
const categoryRoutes = require('./routes/categoryRoutes')

app.use(bookRoutes)
app.use(categoryRoutes)

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500

  if (status === 500) {
    console.error(error.message)
  }

  res.status(status).json({
    message: status === 500 ? 'Ett serverfel uppstod' : error.message,
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

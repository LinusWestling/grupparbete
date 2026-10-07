require('dotenv').config()

const express = require('express')
const cors = require('cors')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const isProduction = process.env.NODE_ENV === 'production'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
)

// Render terminates HTTPS at its reverse proxy.
if (isProduction) {
  app.set('trust proxy', 1)
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET saknas i .env')
}

app.use(
  session({
    name: 'skillswap.sid',
    secret: process.env.SESSION_SECRET,
    ...(isProduction && {
      store: new MySQLStore(
        {
          createDatabaseTable: false,
          expiration: 1000 * 60 * 60 * 8,
        },
        require('mysql2/promise').createPool(require('./database/config')),
      ),
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
)

app.use('/api/auth', require('./routes/authRoutes'))
app.use(express.static('public'))

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

// Import domain routes
const topicRoutes = require('./routes/topicRoutes')
const questionRoutes = require('./routes/questionRoutes')
const quizRoutes = require('./routes/quizRoutes')
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const exampleRoutes = require('./routes/exampleRoutes')

// Mount API routes
app.use(categoryRoutes)
app.use(exampleRoutes)
app.use(topicRoutes)
app.use(questionRoutes)
app.use(quizRoutes)
app.use(userRoutes)
app.use(authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap API Server Running' })
})

app.listen(port, () => console.log(`SkillSwap backend listening on port ${port}!`))
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))

// Import domain routes
const topicRoutes = require('./routes/topicRoutes')
const questionRoutes = require('./routes/questionRoutes')
const quizRoutes = require('./routes/quizRoutes')
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')

// Mount API routes
app.use(topicRoutes)
app.use(questionRoutes)
app.use(quizRoutes)
app.use(userRoutes)
app.use(authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap API Server Running' })
})

app.listen(port, () => console.log(`SkillSwap backend listening on port ${port}!`))

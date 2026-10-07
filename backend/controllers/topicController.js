const topicService = require('../services/topicService')

async function getTopics(req, res) {
  try {
    const topics = await topicService.getAllTopics()
    res.json({ status: 'success', data: topics })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

async function getTopicById(req, res) {
  try {
    const topic = await topicService.getTopicById(req.params.id)
    if (!topic) {
      return res.status(404).json({ status: 'error', message: 'Topic not found' })
    }
    res.json({ status: 'success', data: topic })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

module.exports = {
  getTopics,
  getTopicById,
}

const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/api/topics', topicController.getTopics);
router.get('/api/topics/:id', topicController.getTopicById);

module.exports = router;

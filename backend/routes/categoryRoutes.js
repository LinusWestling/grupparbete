const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/api/categories', categoryController.createCategory);
router.get('/api/categories', categoryController.getCategories);

module.exports = router;
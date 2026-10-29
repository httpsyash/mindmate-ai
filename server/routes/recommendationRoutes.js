const express = require('express');
const router = express.Router();
const { getRecommendations, listRecommendations } = require('../controllers/recommendationController');
const { auth } = require('../middleware/auth');

router.post('/', auth, getRecommendations);
router.get('/', auth, listRecommendations);

module.exports = router;

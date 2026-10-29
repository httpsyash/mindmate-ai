const express = require('express');
const router = express.Router();
const { recordMood, getMoods } = require('../controllers/moodController');
const { auth } = require('../middleware/auth');

router.post('/', auth, recordMood);
router.get('/', auth, getMoods);

module.exports = router;

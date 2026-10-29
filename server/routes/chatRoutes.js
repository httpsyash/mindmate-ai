const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.post('/message', auth, sendMessage);
router.get('/history', auth, getHistory);
router.delete('/history', auth, clearHistory);

module.exports = router;

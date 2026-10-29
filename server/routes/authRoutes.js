const express = require('express');
const router = express.Router();
const { signup, login, me, verifyOtp, googleAuth } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/google', googleAuth);
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/me', auth, me);

module.exports = router;

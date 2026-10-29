const express = require('express');
const router = express.Router();
const { createPlan, getPlans } = require('../controllers/plannerController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createPlan);
router.get('/', auth, getPlans);

module.exports = router;

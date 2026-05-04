const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');

// For now, no auth middleware to make it easier to test
// If you have auth, you can add it here like: const auth = require('../middlewares/auth');
// router.post('/', auth, planController.generatePlan);

router.post('/', planController.generatePlan);

module.exports = router;

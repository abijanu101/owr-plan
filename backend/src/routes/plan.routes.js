const express = require('express');
const router  = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const planController = require('../controllers/plan.controller');

router.post('/', protect, planController.generatePlan);

module.exports = router;

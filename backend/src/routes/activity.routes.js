const express = require('express');
const router = express.Router();
const {
  createActivity,
  getActivityById,
  getUserActivities,
  updateActivity,
  deleteActivity,
  getAvailabilityVisualization,
  getBestTimeSlots,
  bulkCreateActivities,
  parseSchedule,
} = require('../controllers/activityController');

// Core CRUD
router.post('/',       createActivity);
router.post('/bulk',   bulkCreateActivities);
router.post('/parse',  parseSchedule);          // LLM schedule parsing

router.get('/user/:userId',        getUserActivities);
router.get('/visualization/:userId', getAvailabilityVisualization);
router.get('/plan',                getBestTimeSlots);
router.get('/:id',                 getActivityById);

router.put('/:id',    updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
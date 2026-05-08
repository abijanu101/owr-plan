const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
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
  listActivities,
  getActivitiesByEntityID,
  bulkDeleteActivities,
  duplicateActivities,
} = require('../controllers/activityController');

router.use(protect); // Protect all routes below

// Core CRUD
router.post('/',       createActivity);
router.post('/bulk',   bulkCreateActivities);
router.post('/parse',  parseSchedule);          // LLM schedule parsing

router.get('/', listActivities);
router.get('/user/:userId',        getUserActivities);
router.get('/entity/:entityId',    getActivitiesByEntityID);
router.get('/visualization/:userId', getAvailabilityVisualization);
router.get('/plan',                getBestTimeSlots);
router.get('/:id',                 getActivityById);

router.put('/:id',    updateActivity);
router.delete('/:id', deleteActivity);
router.delete('/bulk', bulkDeleteActivities);
router.post('/duplicate', duplicateActivities);

module.exports = router;
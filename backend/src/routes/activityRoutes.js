const express = require('express');
const router = express.Router();

// 👈 CHANGED: Import from activityController
const {
  createActivity,
  listActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  parseSchedule,
  bulkDeleteActivities,
  duplicateActivities,
  getActivitiesByEntityID,
} = require('../controllers/activityController');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes

// POST /api/activities/parse  ← AI schedule parsing (MUST be before /:id)
router.post('/parse', parseSchedule);

// POST /api/activities/duplicate (MUST be before /:id)
router.post('/duplicate', duplicateActivities);

// DELETE /api/activities/bulk (MUST be before /:id)
router.delete('/bulk', bulkDeleteActivities);

// GET /api/activities/entity/:entityId
router.get('/entity/:entityId', getActivitiesByEntityID);

// GET all activities
router.get('/', listActivities);

// POST create activity
router.post('/', createActivity);

// GET /api/activities/:id
router.get('/:id', getActivityById);

// PUT /api/activities/:id
router.put('/:id', updateActivity);

// DELETE /api/activities/:id
router.delete('/:id', deleteActivity);

module.exports = router;
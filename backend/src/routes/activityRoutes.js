const express = require('express');
const router = express.Router();

// 👈 CHANGED: Import from activityController1 instead of activityController
const {
  createActivity,
  listActivities,
  updateActivity,
  bulkDeleteActivities,
  duplicateActivities,
} = require('../controllers/activityController1');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes

// POST /api/activities/duplicate (MUST be before /:id)
router.post('/duplicate', duplicateActivities);

// DELETE /api/activities/bulk (MUST be before /:id)
router.delete('/bulk', bulkDeleteActivities);

// GET all activities
router.get('/', listActivities);

// POST create activity
router.post('/', createActivity);

// PUT /api/activities/:id
router.put('/:id', updateActivity);

module.exports = router;
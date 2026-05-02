// 👈 CHANGED: Import from Activities1 instead of Activities
const Activity = require('../models/Activities1');

/**
 * Transform MongoDB document to frontend format
 * Matches EXACT format of your stubs
 */
const transformActivity = (activity) => ({
  id: activity._id?.toString(),
  title: activity.title,
  timeRange: activity.timeRange || '',
  date: activity.date || '',
  days: activity.days || [],
  participants: activity.participantNames?.length > 0 
    ? activity.participantNames 
    : [],
  createdAt: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
});

/**
 * POST /api/activities
 * Create activity - Returns SINGLE object (matches stub)
 */
const createActivity = async (req, res) => {
  try {
    const { userId, title, timeRange, date, days, participants, participantNames } = req.body;

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required.' 
      });
    }

    const names = participantNames || 
      (Array.isArray(participants) && participants.every(p => typeof p === 'string') 
        ? participants 
        : []);

    const activity = new Activity({
      userId: userId || '000000000000000000000001',
      title: title.trim(),
      timeRange: timeRange || '',
      date: date || '',
      days: days || [],
      participantNames: names,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await activity.save();
    
    const transformed = transformActivity(activity);

    res.status(201).json({ 
      success: true, 
      data: transformed
    });
  } catch (err) {
    console.error('createActivity error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create activity'
    });
  }
};

/**
 * GET /api/activities
 * List activities - Returns ARRAY (matches stub)
 */
const listActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .lean();

    const transformed = activities.map(transformActivity);

    res.status(200).json({ 
      success: true, 
      data: transformed
    });
  } catch (err) {
    console.error('listActivities error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activities'
    });
  }
};

/**
 * PUT /api/activities/:id
 * Update activity - Returns SINGLE object (matches stub)
 */
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Clean updates
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    // Handle participant names update
    if (updates.participants && Array.isArray(updates.participants)) {
      if (updates.participants.every(p => typeof p === 'string')) {
        updates.participantNames = updates.participants;
      }
    }

    updates.updatedAt = Date.now();

    const activity = await Activity.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }

    const transformed = transformActivity(activity);

    res.status(200).json({ 
      success: true, 
      data: transformed
    });
  } catch (err) {
    console.error('updateActivity error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid activity ID' 
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update activity'
    });
  }
};

/**
 * DELETE /api/activities/bulk
 * Bulk delete - Returns NOTHING (matches stub)
 */
const bulkDeleteActivities = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ids array is required' 
      });
    }

    await Activity.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ 
      success: true
    });
  } catch (err) {
    console.error('bulkDeleteActivities error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete activities'
    });
  }
};

/**
 * POST /api/activities/duplicate
 * Duplicate activities - Returns ARRAY (matches stub)
 */
const duplicateActivities = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ids array is required' 
      });
    }

    const originals = await Activity.find({ _id: { $in: ids } }).lean();

    if (originals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No activities found to duplicate' 
      });
    }

    // Clean duplicate - remove Mongoose specific fields
    const duplicates = originals.map(original => {
      const { _id, __v, createdAt, updatedAt, ...rest } = original;
      return {
        ...rest,
        title: `${rest.title} (copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });

    const created = await Activity.insertMany(duplicates);
    const transformed = created.map(transformActivity);

    res.status(201).json({ 
      success: true, 
      data: transformed
    });
  } catch (err) {
    console.error('duplicateActivities error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to duplicate activities'
    });
  }
};

module.exports = {
  createActivity,
  listActivities,
  updateActivity,
  bulkDeleteActivities,
  duplicateActivities,
};
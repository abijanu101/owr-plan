const Activity = require('../models/Activities');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createActivity = async (req, res) => {
  try {
    const { userId, title, entities, description, location, startTime, endTime } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'userId and title are required' });
    }
    const activity = await Activity.create({
      userId,
      title,
      description: description || '',
      location: location || {},
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      entities: Array.isArray(entities) ? entities : []
    });
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating activity' });
  }
};

const bulkCreateActivities = async (req, res) => {
  try {
    const { activities } = req.body;
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ success: false, message: 'activities array is required' });
    }
    const result = await Activity.insertMany(activities);
    res.status(201).json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error('Bulk create activities error:', error);
    res.status(500).json({ success: false, message: 'Server error while bulk creating activities' });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const activities = await Activity.find({ userId });
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching activities' });
  }
};

const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    console.error('Get activity by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching activity' });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }
    const activity = await Activity.findByIdAndUpdate(id, updates, { new: true });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating activity' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting activity' });
  }
};

const getAvailabilityVisualization = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    console.error('Availability visualization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBestTimeSlots = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    console.error('Best time slots error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createActivity,
  getActivityById,
  getUserActivities,
  updateActivity,
  deleteActivity,
  getAvailabilityVisualization,
  getBestTimeSlots,
  bulkCreateActivities
};
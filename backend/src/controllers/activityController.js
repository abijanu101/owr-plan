const createActivity = async (req, res) => {
  res.status(201).json({
    success: true,
    data: { activity: { id: 'dummy-activity', ...req.body } }
  });
};

const bulkCreateActivities = async (req, res) => {
  res.status(201).json({
    success: true,
    data: { activities: Array.isArray(req.body) ? req.body : [] }
  });
};

const getUserActivities = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { activities: [] }
  });
};

const getActivityById = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { activity: { id: req.params.id } }
  });
};

const updateActivity = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { activity: { id: req.params.id, ...req.body } }
  });
};

const deleteActivity = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Activity ${req.params.id} deleted successfully`
  });
};

const getAvailabilityVisualization = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { visualization: [] }
  });
};

const getBestTimeSlots = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { slots: [] }
  });
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
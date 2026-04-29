const Icon = require('../models/Icons');

const uploadIcon = async (req, res) => {
  try {
    const { type, filename } = req.body;
    if (!type || !filename) {
      return res.status(400).json({ success: false, message: 'Icon type and filename are required' });
    }

    const icon = await Icon.create({ type, filename });
    res.status(201).json({ success: true, data: icon });
  } catch (error) {
    console.error('Upload icon error:', error);
    res.status(500).json({ success: false, message: 'Server error while uploading icon' });
  }
};

const getAllIcons = async (req, res) => {
  try {
    const icons = await Icon.find();
    res.status(200).json({ success: true, count: icons.length, data: icons });
  } catch (error) {
    console.error('Get all icons error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching icons' });
  }
};

const getIconById = async (req, res) => {
  try {
    const { id } = req.params;
    const icon = await Icon.findById(id);
    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }
    res.status(200).json({ success: true, data: icon });
  } catch (error) {
    console.error('Get icon by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching icon' });
  }
};

const deleteIcon = async (req, res) => {
  try {
    const { id } = req.params;
    const icon = await Icon.findById(id);
    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }
    await icon.deleteOne();
    res.status(200).json({ success: true, message: 'Icon deleted successfully' });
  } catch (error) {
    console.error('Delete icon error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting icon' });
  }
};

module.exports = {
  uploadIcon,
  getAllIcons,
  getIconById,
  deleteIcon
};
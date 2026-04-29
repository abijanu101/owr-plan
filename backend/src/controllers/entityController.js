const mongoose = require('mongoose');
const Entity = require('../models/Entities');
const Activity = require('../models/Activities');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createEntity = async (req, res) => {
  try {
    const { type, name, color, faceIcon, accessories, members } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!type || !['person', 'group'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Entity type must be "person" or "group"' });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Entity name is required' });
    }

    const newEntity = await Entity.create({
      userId,
      type,
      name,
      color: color || '#000000',
      faceIcon: faceIcon || null,
      accessories: Array.isArray(accessories) ? accessories : [],
      members: type === 'group' && Array.isArray(members) ? members : []
    });

    res.status(201).json({ success: true, data: newEntity });
  } catch (error) {
    console.error('Create entity error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating entity' });
  }
};

const getEntitiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const entities = await Entity.find({ userId })
      .populate('faceIcon')
      .populate('accessories')
      .populate('members');

    res.status(200).json({ success: true, count: entities.length, data: entities });
  } catch (error) {
    console.error('Get entities by user error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching entities' });
  }
};

const getEntityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const entity = await Entity.findById(id)
      .populate('faceIcon')
      .populate('accessories')
      .populate('members');

    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    res.status(200).json({ success: true, data: entity });
  } catch (error) {
    console.error('Get entity by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching entity' });
  }
};

const updateEntity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const entity = await Entity.findById(id);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    if (req.user && entity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this entity' });
    }

    const allowedUpdates = ['name', 'color', 'faceIcon', 'accessories'];
    allowedUpdates.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        entity[field] = updates[field];
      }
    });

    await entity.save();
    res.status(200).json({ success: true, data: entity });
  } catch (error) {
    console.error('Update entity error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating entity' });
  }
};

const deleteEntity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const entity = await Entity.findById(id);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    if (req.user && entity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this entity' });
    }

    await entity.deleteOne();
    res.status(200).json({ success: true, message: 'Entity deleted successfully' });
  } catch (error) {
    console.error('Delete entity error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting entity' });
  }
};

const addMemberToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid entity or member ID' });
    }

    const group = await Entity.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.type !== 'group') {
      return res.status(400).json({ success: false, message: 'Members can only be added to groups' });
    }

    const member = await Entity.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member entity not found' });
    }

    if (member.type === 'group') {
      return res.status(400).json({ success: false, message: 'Cannot add a group as a member of another group' });
    }

    if (group.members.includes(memberId)) {
      return res.status(409).json({ success: false, message: 'Member already exists in group' });
    }

    group.members.push(memberId);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    console.error('Add member to group error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding member to group' });
  }
};

const removeMemberFromGroup = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(memberId)) {
      return res.status(400).json({ success: false, message: 'Invalid entity or member ID' });
    }

    const group = await Entity.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const index = group.members.indexOf(memberId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Member not found in group' });
    }

    group.members.splice(index, 1);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    console.error('Remove member from group error:', error);
    res.status(500).json({ success: false, message: 'Server error while removing member from group' });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const group = await Entity.findById(id)
      .populate('members')
      .populate('faceIcon')
      .populate('accessories');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.type !== 'group') {
      return res.status(400).json({ success: false, message: 'This entity is not a group' });
    }

    res.status(200).json({ success: true, count: group.members.length, data: group.members });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching group members' });
  }
};

const editProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const entity = await Entity.findById(id);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    if (req.user && entity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this profile' });
    }

    const allowedUpdates = ['name', 'color', 'faceIcon', 'accessories'];
    allowedUpdates.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        entity[field] = updates[field];
      }
    });

    await entity.save();
    res.status(200).json({ success: true, data: entity });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).json({ success: false, message: 'Server error while editing profile' });
  }
};

const viewSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const entity = await Entity.findById(id);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    const schedule = await Activity.find({ entities: id })
      .sort('startTime')
      .populate('entities', 'name type')
      .populate('userId', 'name email');

    res.status(200).json({ success: true, count: schedule.length, data: schedule });
  } catch (error) {
    console.error('View schedule error:', error);
    res.status(500).json({ success: false, message: 'Server error while loading schedule' });
  }
};

const getActivitiesForEntity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid entity ID' });
    }

    const entity = await Entity.findById(id);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    const activities = await Activity.find({ entities: id })
      .sort('-createdAt')
      .populate('entities', 'name type')
      .populate('userId', 'name email');

    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    console.error('Get activities for entity error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching activities' });
  }
};

module.exports = {
  createEntity,
  getEntityById,
  getEntitiesByUser,
  updateEntity,
  deleteEntity,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupMembers,
  editProfile,
  viewSchedule,
  getActivitiesForEntity
};

const Entity = require('../models/Entities');

function pickEntityUpdate(body = {}) {
  const next = {};
  for (const key of ['name', 'type', 'color', 'faceIcon', 'accessories', 'members', 'groups']) {
    if (Object.prototype.hasOwnProperty.call(body, key)) next[key] = body[key];
  }
  return next;
}

function normalizeEntityPayload(payload = {}) {
  const next = { ...payload };
  if (typeof next.name === 'string') next.name = next.name.trim();
  if (!Array.isArray(next.accessories)) next.accessories = [];
  return next;
}

function coerceByType(next = {}) {
  // Keep both fields in schema, but enforce mutually exclusive behavior by type.
  if (next.type === 'person') {
    next.members = [];
  }
  if (next.type === 'group') {
    next.groups = [];
  }
  return next;
}

const createEntity = async (req, res) => {
    try {
        const incoming = normalizeEntityPayload(req.body);
        const coerced = coerceByType({
          name: incoming.name,
          type: incoming.type ?? 'person',
          color: incoming.color,
          faceIcon: incoming.faceIcon,
          accessories: incoming.accessories
        });

        const entity = await Entity.create({
            userId: req.user._id,
            ...coerced
        });

        res.json(entity);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Name already exists" });
        }
        res.status(500).json({ message: "Error creating entity" });
    }
};

const updateEntity = async (req, res) => {
    try {
        const update = normalizeEntityPayload(pickEntityUpdate(req.body));
        const existing = await Entity.findOne({ _id: req.params.id, userId: req.user._id });

        if (!existing) {
          return res.status(404).json({ message: "Entity not found" });
        }

        const nextType = update.type ?? existing.type;
        const next = coerceByType({ ...update, type: nextType });

        const updated = await Entity.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: next },
            { new: true, runValidators: true }
        );

        res.json(updated);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Name already exists" });
        }
        res.status(500).json({ message: "Error updating entity" });
    }
};

const getEntityById = async (req, res) => {
  try {
    const entity = await Entity.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('members', 'name color')   // populate members (person entities)
      .populate('groups', 'name color');   // populate groups (group entities)
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.json(entity);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entity" });
  }
};

const getEntitiesByUser = async (req, res) => {
  try {
    const entities = await Entity.find({ userId: req.user._id })
      .populate('members', 'name color')   // populate members with name+color
      .populate('groups', 'name color')    // populate groups with name+color
      .sort({ createdAt: -1 });
    res.json(entities);
  } catch (err) {
    res.status(500).json({ message: "Error fetching entities" });
  }
};

const deleteEntity = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Entity ${req.params.id} deleted successfully`
  });
};

const addMemberToGroup = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { member: req.body }
  });
};

const removeMemberFromGroup = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Member ${req.params.memberId} removed from group ${req.params.id}`
  });
};

const getGroupMembers = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { members: [] }
  });
};

const editProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { profile: req.body }
  });
};

const viewSchedule = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { schedule: [] }
  });
};

const getActivitiesForEntity = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { activities: [] }
  });
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
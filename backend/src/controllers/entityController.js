const Entity = require('../models/Entities');

// ─── Helpers ──────────────────────────────────────────────────

// Only pick keys that were actually sent in the body
function pickEntityUpdate(body = {}) {
  const allowed = ['name', 'type', 'color', 'faceIcon', 'accessories', 'members', 'groups', 'theme'];
  const next = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) next[key] = body[key];
  }
  return next;
}

function normalizeName(payload = {}) {
  const next = { ...payload };
  if (typeof next.name === 'string') next.name = next.name.trim();
  // FIX: do NOT touch accessories here — only normalize name
  // The old normalizeEntityPayload was forcing accessories=[] whenever
  // accessories wasn't in the payload, wiping them on every PATCH
  return next;
}

function coerceByType(next = {}, isPartialUpdate = false) {
  // FIX: on a partial PATCH we only enforce the constraint if the caller
  // actually sent the conflicting field — otherwise leave it alone.
  // Full create/replace always enforces both.
  if (!isPartialUpdate) {
    if (next.type === 'person') next.members = [];
    if (next.type === 'group')  next.groups  = [];
  }
  return next;
}

// ─── CREATE ───────────────────────────────────────────────────
const createEntity = async (req, res) => {
  try {
    const incoming = normalizeName(req.body);
    const coerced  = coerceByType({
      name:        incoming.name,
      type:        incoming.type ?? 'person',
      color:       incoming.color,
      faceIcon:    incoming.faceIcon,
      accessories: Array.isArray(incoming.accessories) ? incoming.accessories : [],
      theme:       incoming.theme ?? 'dark',
    }, false);

    const entity = await Entity.create({ userId: req.user._id, ...coerced });
    res.json(entity);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Name already exists' });
    res.status(500).json({ message: 'Error creating entity' });
  }
};

// ─── UPDATE (PUT = full replace, PATCH = partial) ─────────────
// Both routes point here. PATCH is partial — only fields sent are updated.
const updateEntity = async (req, res) => {
  try {
    const isPartial = req.method === 'PATCH';
    const picked    = pickEntityUpdate(req.body);
    const update    = normalizeName(picked);

    // FIX: only add accessories default on full PUT, never on PATCH
    if (!isPartial && !Object.prototype.hasOwnProperty.call(update, 'accessories')) {
      update.accessories = [];
    }

    const existing = await Entity.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Entity not found' });

    const nextType = update.type ?? existing.type;
    const next     = coerceByType({ ...update, type: nextType }, isPartial);

    // FIX: on PATCH, remove type from $set if it wasn't sent — don't overwrite it
    if (isPartial && !Object.prototype.hasOwnProperty.call(req.body, 'type')) {
      delete next.type;
    }

    const updated = await Entity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: next },
      { new: true, runValidators: true }
    )
      .populate('members', 'name color type')
      .populate('groups',  'name color type');

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Name already exists' });
    console.error('updateEntity error:', err);
    res.status(500).json({ message: 'Error updating entity' });
  }
};

// ─── GET ONE ──────────────────────────────────────────────────
const getEntityById = async (req, res) => {
  try {
    const entity = await Entity.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('members', 'name color type')  // FIX: include type so frontend knows person vs group
      .populate('groups',  'name color type');
    if (!entity) return res.status(404).json({ message: 'Entity not found' });
    res.json(entity);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching entity' });
  }
};

// ─── GET ALL FOR USER ─────────────────────────────────────────
// FIX: was missing .populate() entirely — members/groups came back as raw
// ObjectId arrays with no name/color, so frontend chips had nothing to render
const getEntitiesByUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'No user in request' });
    }
    const entities = await Entity.find({ userId: req.user._id })
      .populate('members', 'name color type')
      .populate('groups',  'name color type')
      .sort({ createdAt: -1 });

    res.json(entities);
  } catch (err) {
    console.error('getEntitiesByUser error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────
const deleteEntity = async (req, res) => {
  try {
    const deleted = await Entity.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Entity not found' });
    res.json({ success: true, message: `Entity ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting entity' });
  }
};

// ─── Stubs (unchanged) ────────────────────────────────────────
const addMemberToGroup = async (req, res) => {
  res.status(200).json({ success: true, data: { member: req.body } });
};

const removeMemberFromGroup = async (req, res) => {
  res.status(200).json({ success: true, message: `Member ${req.params.memberId} removed from group ${req.params.id}` });
};

const getGroupMembers = async (req, res) => {
  res.status(200).json({ success: true, data: { members: [] } });
};

const editProfile = async (req, res) => {
  res.status(200).json({ success: true, data: { profile: req.body } });
};

const viewSchedule = async (req, res) => {
  res.status(200).json({ success: true, data: { schedule: [] } });
};

const getActivitiesForEntity = async (req, res) => {
  res.status(200).json({ success: true, data: { activities: [] } });
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
  getActivitiesForEntity,
};
const Activity = require('../models/Activities');

// Helper – turn a slot's "08:30 AM" strings into a real Date on a given ISO day offset
const timeStringToDate = (timeStr, baseDate = new Date()) => {
  try {
    const [time, period] = timeStr.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
  } catch {
    return baseDate;
  }
};

const transformActivity = (activity) => {
  const slots = activity.slots || [];
  
  // compute timeRange (e.g. from first slot)
  let timeRange = '';
  if (slots.length > 0) {
    timeRange = `${slots[0].startTime} - ${slots[0].endTime}`;
  }

  // compute days (e.g. ['M', 'T', 'W'])
  const dayMap = { 'Monday': 'M', 'Tuesday': 'T', 'Wednesday': 'W', 'Thursday': 'TH', 'Friday': 'F', 'Saturday': 'SA', 'Sunday': 'S' };
  const days = [...new Set(slots.map(s => dayMap[s.day] || s.day))];

  // compute date string
  let date = '';
  if (activity.recurrence?.enabled) {
    date = `Every ${activity.recurrence.interval > 1 ? activity.recurrence.interval + ' ' : ''}${activity.recurrence.frequency}s`;
  } else {
    date = 'One-time';
  }

  return {
    id: activity._id?.toString(),
    title: activity.title,
    timeRange,
    date,
    days,
    participants: activity.participants?.map(p => p.name || p.toString()) || [],
    createdAt: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
  };
};

// POST /api/activities
const createActivity = async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      participants,
      scheduleMode,
      slots,
      pastedScheduleRaw,
      parsedSlots,
      recurrence,
    } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'userId and title are required.' });
    }

    const activeSlots = scheduleMode === 'paste' ? (parsedSlots || []) : (slots || []);

    const activity = new Activity({
      userId,
      title,
      description,
      participants: participants || [],
      scheduleMode: scheduleMode || 'structured',
      slots: scheduleMode === 'structured' ? activeSlots : [],
      pastedScheduleRaw: scheduleMode === 'paste' ? pastedScheduleRaw : '',
      parsedSlots: scheduleMode === 'paste' ? activeSlots : [],
      recurrence: recurrence || {},
      // Legacy: set startTime/endTime from first slot if available
      startTime: activeSlots[0] ? timeStringToDate(activeSlots[0].startTime) : undefined,
      endTime:   activeSlots[0] ? timeStringToDate(activeSlots[0].endTime)   : undefined,
    });

    await activity.save();

    res.status(201).json({ success: true, data: { activity } });
  } catch (err) {
    console.error('createActivity error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/activities/bulk
const bulkCreateActivities = async (req, res) => {
  try {
    const activities = await Activity.insertMany(
      Array.isArray(req.body) ? req.body : []
    );
    res.status(201).json({ success: true, data: { activities } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/activities/parse-schedule
// Accepts free-form text and uses an LLM to extract structured slots.
// Falls back to returning an empty array with a hint when no API key is set.
const parseSchedule = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) {
      return res.status(400).json({ success: false, message: 'rawText is required.' });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // No key configured – return stub response so FE can still demo
      return res.status(200).json({
        success: true,
        parsed: [],
        warning: 'No LLM API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY in .env to enable AI parsing.'
      });
    }

    // --- OpenAI path ---
    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `You are a schedule parser. Extract time slots from the user's text and return ONLY a JSON array.
Each element must have: { "day": "Monday|Tuesday|...|Sunday", "startTime": "HH:MM AM/PM", "endTime": "HH:MM AM/PM", "label": "string" }.
Return [] if nothing parseable is found. No markdown, no explanation.`;

      const chat = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: rawText }
        ],
        temperature: 0,
      });

      const parsed = JSON.parse(chat.choices[0].message.content.trim());
      return res.status(200).json({ success: true, parsed });
    }

    // --- Gemini path (stub, extend as needed) ---
    return res.status(200).json({
      success: true,
      parsed: [],
      warning: 'Gemini parsing not yet implemented. Add logic in parseSchedule controller.'
    });

  } catch (err) {
    console.error('parseSchedule error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/activities/user/:userId
const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId })
      .populate('participants', 'name icon color')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { activities } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/activities/:id
const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('participants', 'name icon color');
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found.' });
    res.status(200).json({ success: true, data: { activity } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/activities/:id
const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found.' });
    res.status(200).json({ success: true, data: { activity } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/activities/:id
const deleteActivity = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: `Activity ${req.params.id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAvailabilityVisualization = async (req, res) => {
  res.status(200).json({ success: true, data: { visualization: [] } });
};

const getBestTimeSlots = async (req, res) => {
  res.status(200).json({ success: true, data: { slots: [] } });
};

// GET /api/activities
const listActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('participants', 'name icon color')
      .sort({ createdAt: -1 })
      .lean();

    const transformed = activities.map(transformActivity);

    res.status(200).json({ 
      success: true, 
      data: transformed
    });
  } catch (err) {
    console.error('listActivities error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
};

// DELETE /api/activities/bulk
const bulkDeleteActivities = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }

    await Activity.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('bulkDeleteActivities error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete activities' });
  }
};

// POST /api/activities/duplicate
const duplicateActivities = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }

    const originals = await Activity.find({ _id: { $in: ids } }).populate('participants', 'name icon color').lean();

    if (originals.length === 0) {
      return res.status(404).json({ success: false, message: 'No activities found to duplicate' });
    }

    const duplicates = originals.map(original => {
      const { _id, __v, createdAt, updatedAt, ...rest } = original;
      return {
        ...rest,
        title: `${rest.title} (copy)`,
        participants: original.participants.map(p => p._id),
      };
    });

    const created = await Activity.insertMany(duplicates);
    
    // Populate participants so transformActivity gets names
    const populated = await Activity.find({ _id: { $in: created.map(c => c._id) } }).populate('participants', 'name icon color').lean();
    
    const transformed = populated.map(transformActivity);

    res.status(201).json({ success: true, data: transformed });
  } catch (err) {
    console.error('duplicateActivities error:', err);
    res.status(500).json({ success: false, message: 'Failed to duplicate activities' });
  }
};

module.exports = {
  createActivity,
  bulkCreateActivities,
  parseSchedule,
  getUserActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getAvailabilityVisualization,
  getBestTimeSlots,
  listActivities,
  bulkDeleteActivities,
  duplicateActivities,
};
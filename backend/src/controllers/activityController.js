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
  const type = activity.activityType || 'non-recurring';

  // ── Non-recurring ───────────────────────────────────────────────────────
  if (type === 'non-recurring') {
    const start = activity.rangeStart ? new Date(activity.rangeStart) : null;
    const end   = activity.rangeEnd   ? new Date(activity.rangeEnd)   : null;
    const fmt = (d) => d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '?';
    const fmtTime = (d) => d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
    return {
      id: activity._id?.toString(),
      title: activity.title,
      activityType: 'non-recurring',
      rangeStart: activity.rangeStart,
      rangeEnd:   activity.rangeEnd,
      timeRange: start && end ? `${fmtTime(start)} – ${fmtTime(end)}` : '',
      dateLabel: start ? fmt(start) : '',
      participants: activity.participants?.map(p => p.name || p.toString()) || [],
      createdAt: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
    };
  }

  // ── Recurring ────────────────────────────────────────────────────────────
  const interval  = activity.everyInterval || 1;
  const unit      = activity.everyUnit || 'Week';
  const plural    = interval > 1 ? `${interval} ${unit}s` : unit;
  const everyStr  = `Every ${plural}`;

  const day = activity.recurringDay;
  const scheduleStr = day ? `${everyStr} on ${day}` : everyStr;

  let expiryStr = 'No expiry';
  if (activity.expiryType === 'on_date' && activity.expiryDate) {
    expiryStr = `Until ${new Date(activity.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else if (activity.expiryType === 'after') {
    expiryStr = `After ${activity.expiryOccurrences} occurrence${activity.expiryOccurrences !== 1 ? 's' : ''}`;
  }

  return {
    id: activity._id?.toString(),
    title: activity.title,
    activityType: 'recurring',
    recurringStartTime: activity.recurringStartTime,
    recurringEndTime:   activity.recurringEndTime,
    everyInterval:  interval,
    everyUnit:      unit,
    recurringDay:   day,
    scheduleStr,
    expiryStr,
    timeRange: `${activity.recurringStartTime || ''} – ${activity.recurringEndTime || ''}`,
    participants: activity.participants?.map(p => p.name || p.toString()) || [],
    createdAt: activity.createdAt ? new Date(activity.createdAt).getTime() : Date.now(),
  };
};

// POST /api/activities
const createActivity = async (req, res) => {
  try {
    const {
      userId, title, description, participants,
      activityType,
      // non-recurring
      rangeStart, rangeEnd,
      // recurring
      recurringStartTime, recurringEndTime,
      everyInterval, everyUnit,
      recurringDay, recurringStartDate,
      expiryType, expiryDate, expiryOccurrences,
    } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'userId and title are required.' });
    }

    const type = activityType || 'non-recurring';

    const activity = new Activity({
      userId, title, description,
      participants: participants || [],
      activityType: type,
      // non-recurring
      rangeStart: type === 'non-recurring' ? rangeStart : undefined,
      rangeEnd:   type === 'non-recurring' ? rangeEnd   : undefined,
      // recurring
      recurringStartTime: type === 'recurring' ? (recurringStartTime || '08:00 AM') : undefined,
      recurringEndTime:   type === 'recurring' ? (recurringEndTime   || '09:00 AM') : undefined,
      everyInterval:      type === 'recurring' ? (everyInterval || 1)   : undefined,
      everyUnit:          type === 'recurring' ? (everyUnit || 'Week')   : undefined,
      recurringDay:       type === 'recurring' ? (recurringDay || null)  : undefined,
      recurringStartDate: type === 'recurring' ? recurringStartDate      : undefined,
      expiryType:         type === 'recurring' ? (expiryType || 'never') : undefined,
      expiryDate:         type === 'recurring' ? expiryDate              : undefined,
      expiryOccurrences:  type === 'recurring' ? (expiryOccurrences || 1): undefined,
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

// POST /api/activities/parse
// Uses Groq LLM to parse free-form schedule text into structured slots.
const parseSchedule = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'rawText is required.' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        parsed: [],
        warning: 'No GROQ_API_KEY configured in .env. Add your Groq API key to enable AI parsing.'
      });
    }

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are a schedule parser. Your only job is to extract time slots from the user's text.

Return ONLY a valid JSON array. No markdown, no explanation, no extra text — just the raw JSON array.

Each element in the array must have exactly these fields:
- "day": one of "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
- "startTime": in "HH:MM AM" or "HH:MM PM" format (12-hour clock, always padded e.g. "09:00 AM", "02:30 PM")
- "endTime": in the same "HH:MM AM"/"HH:MM PM" format
- "label": a short string label/course code/subject if mentioned, otherwise an empty string ""

Rules:
- Convert 24-hour times to 12-hour AM/PM format.
- Expand short day names: Mon→Monday, Tue→Tuesday, Wed→Wednesday, Thu→Thursday, Fri→Friday, Sat→Saturday, Sun→Sunday.
- If a slot repeats across multiple days, create one entry per day.
- If no valid slots are found, return an empty array: []
- Never include any text outside the JSON array.`;

    const chat = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: rawText.trim() }
      ],
      temperature: 0,
      max_tokens: 1024,
    });

    const raw = chat.choices[0]?.message?.content?.trim() || '[]';

    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Groq returned non-JSON:', cleaned);
      return res.status(200).json({
        success: true,
        parsed: [],
        warning: 'AI returned an unreadable response. Please try rephrasing your schedule.'
      });
    }

    // Validate/sanitise each slot
    const VALID_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const TIME_RE = /^\d{1,2}:\d{2} (AM|PM)$/;

    const sanitised = parsed
      .filter(s => s && typeof s === 'object')
      .map(s => ({
        day:       VALID_DAYS.includes(s.day) ? s.day : null,
        startTime: TIME_RE.test(s.startTime) ? s.startTime : null,
        endTime:   TIME_RE.test(s.endTime)   ? s.endTime   : null,
        label:     typeof s.label === 'string' ? s.label.trim() : '',
      }))
      .filter(s => s.day && s.startTime && s.endTime);

    return res.status(200).json({ success: true, parsed: sanitised });

  } catch (err) {
    console.error('parseSchedule error:', err);
    res.status(500).json({ success: false, message: 'AI parsing failed: ' + err.message });
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

/**
 * @desc    Get all activities for a specific entity
 * @route   GET /api/activities/entity/:entityId
 * @access  Private
 */
const getActivitiesByEntityID = async (req, res) => {
  try {
    const { entityId } = req.params;
    
    // Find activities where participants array contains the entityId
    const activities = await Activity.find({ 
      participants: entityId 
    })
    .populate('participants', 'name type color faceIcon')
    .sort({ createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (err) {
    console.error('getActivitiesByEntityID error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch activities for this entity' 
    });
  }
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
  getActivitiesByEntityID,
  bulkDeleteActivities,
  duplicateActivities,
};
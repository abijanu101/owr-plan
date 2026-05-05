const mongoose = require("mongoose");

// ─── Recurring Activity Schema ────────────────────────────────────────────────
// A recurring activity repeats on a schedule: "Every N Day/Week/Month"
// It has a single time window per occurrence (startTime → endTime)
// and an optional expiry.

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity",
  }],

  // ── Activity type ──────────────────────────────────────────────────────────
  activityType: {
    type: String,
    enum: ['recurring', 'non-recurring'],
    default: 'non-recurring',
  },

  // ── Non-Recurring fields (simple date-time range) ─────────────────────────
  rangeStart: { type: Date },
  rangeEnd:   { type: Date },

  // ── Recurring fields ───────────────────────────────────────────────────────
  // Time window per occurrence
  recurringStartTime: { type: String, default: '08:00 AM' }, // "HH:MM AM/PM"
  recurringEndTime:   { type: String, default: '09:00 AM' },

  // Period: "Every N unit(s)"
  everyInterval: { type: Number, default: 1, min: 1 },
  everyUnit: {
    type: String,
    enum: ['Day', 'Week'],
    default: 'Week',
  },

  // Day of week for weekly recurrence (null means "every day" or "every month date")
  recurringDay: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', null],
    default: null,
  },

  // Optional start date for first occurrence
  recurringStartDate: { type: Date },

  // Expiry of the recurrence
  expiryType: {
    type: String,
    enum: ['never', 'on_date', 'after'],
    default: 'never',
  },
  expiryDate:        { type: Date },
  expiryOccurrences: { type: Number, default: 1 },

  // ── Legacy fields (kept for backward compat, not used in new UI) ──────────
  scheduleMode: {
    type: String,
    enum: ['structured', 'paste', 'range'],
    default: 'structured',
  },
  slots: [new mongoose.Schema({
    day: { type: String },
    startTime: { type: String },
    endTime:   { type: String },
    label:     { type: String, default: '' },
  }, { _id: false })],

}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
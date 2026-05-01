const mongoose = require("mongoose");

const scheduleSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { type: String, required: true }, // "08:30 AM"
  endTime:   { type: String, required: true }, // "10:00 AM"
  label:     { type: String, default: '' }
}, { _id: false });

const recurrenceSchema = new mongoose.Schema({
  enabled:     { type: Boolean, default: false },
  interval:    { type: Number, default: 1 },           // every N
  frequency:   { type: String, enum: ['Day', 'Week', 'Month'], default: 'Week' },
  endType:     { type: String, enum: ['never', 'on_date', 'after'], default: 'never' },
  endDate:     { type: Date },
  occurrences: { type: Number, default: 1 }
}, { _id: false });

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity"
  }],

  scheduleMode: {
    type: String,
    enum: ['structured', 'paste'],
    default: 'structured'
  },

  slots: [scheduleSlotSchema],

  pastedScheduleRaw: { type: String, default: '' }, // original pasted text
  parsedSlots:       [scheduleSlotSchema],           // LLM-parsed result from paste

  recurrence: { type: recurrenceSchema, default: () => ({}) },

  // Legacy / computed fields
  startTime: Date,
  endTime:   Date,

}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
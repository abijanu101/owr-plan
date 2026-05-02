const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: '000000000000000000000001',
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  timeRange: {
    type: String,
    default: '',
  },
  date: {
    type: String,
    default: '',
  },
  days: [{
    type: String,
    enum: ['M', 'T', 'W', 'TH', 'F', 'SA', 'S'],
  }],
  participantNames: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
activitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Activity1', activitySchema);
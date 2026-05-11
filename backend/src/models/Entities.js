const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ["person", "group"],
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  color: {
    type: String,
    default: "var(--color-primary)"
  },

  faceIcon: {
    type: String,
    default: "face/happy.svg"
  },

  accessories: {
    type: [String],
    default: []
  },

  theme: {
    type: String,
    enum: ["dark", "light"],
    default: "dark"
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity",
    default: []
  }],

  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity",
    default: []
  }]

}, { timestamps: true });

// Index for faster lookups by userId
entitySchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("Entity", entitySchema);


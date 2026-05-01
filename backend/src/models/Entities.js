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
    default: "#000000"
  },

  faceIcon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Icon",
    default: null
  },

  accessory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Icon",
    default: null
  },

  addons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Icon"
  }],

  // enforce that group cant reference groups inside in backend logic 
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity"
  }]

}, { timestamps: true });

module.exports = mongoose.model("Entity", entitySchema);


const mongoose = require("mongoose");

const iconSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["accessory", "face", "expense"],
    required: true
  },
  filename: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Icon', iconSchema);
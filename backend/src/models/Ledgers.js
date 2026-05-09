const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paid: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const ledgerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    enum: ['cake', 'gift', 'food'],
    default: 'food'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  people: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity",
    required: true
  }],
  initialTransactions: {
    type: [transactionSchema],
    default: []
  },
  settlementTransactions: {
    type: [transactionSchema],
    default: []
  },
  // Added status to track if the ledger is settled
  status: {
    type: String,
    enum: ['pending', 'settled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model("Ledger", ledgerSchema);
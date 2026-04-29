const Ledger = require('../models/Ledgers');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createLedger = async (req, res) => {
  try {
    const { userId, title, members } = req.body;
    if (!userId || !title || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'userId, title, and members are required' });
    }
    const ledger = await Ledger.create({ userId, title, members });
    res.status(201).json({ success: true, data: ledger });
  } catch (error) {
    console.error('Create ledger error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating ledger' });
  }
};

const getLedgerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.status(200).json({ success: true, data: ledger });
  } catch (error) {
    console.error('Get ledger by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching ledger' });
  }
};

const getUserLedgers = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const ledgers = await Ledger.find({ userId });
    res.status(200).json({ success: true, count: ledgers.length, data: ledgers });
  } catch (error) {
    console.error('Get user ledgers error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching ledgers' });
  }
};

const updateLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID' });
    }
    const ledger = await Ledger.findByIdAndUpdate(id, updates, { new: true });
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.status(200).json({ success: true, data: ledger });
  } catch (error) {
    console.error('Update ledger error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating ledger' });
  }
};

const deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID' });
    }
    const ledger = await Ledger.findByIdAndDelete(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.status(200).json({ success: true, message: 'Ledger deleted successfully' });
  } catch (error) {
    console.error('Delete ledger error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting ledger' });
  }
};

const addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = req.body;
    if (!isValidId(id) || !expense || typeof expense.amount !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID or expense payload' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    ledger.expenses.push(expense);
    await ledger.save();
    res.status(200).json({ success: true, data: ledger });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id, expenseId } = req.params;
    const updates = req.body;
    if (!isValidId(id) || !isValidId(expenseId)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger or expense ID' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    const expense = ledger.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    Object.assign(expense, updates);
    await ledger.save();
    res.status(200).json({ success: true, data: ledger });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id, expenseId } = req.params;
    if (!isValidId(id) || !isValidId(expenseId)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger or expense ID' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    const expense = ledger.expenses.id(expenseId);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    expense.remove();
    await ledger.save();
    res.status(200).json({ success: true, data: ledger });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting expense' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.status(200).json({ success: true, count: ledger.expenses.length, data: ledger.expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching expenses' });
  }
};

const generateSettlementTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    console.error('Generate settlement transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error while generating settlements' });
  }
};

const getLedgerBalance = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ledger ID' });
    }
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    const total = ledger.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    res.status(200).json({ success: true, data: { balance: total } });
  } catch (error) {
    console.error('Get ledger balance error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching balance' });
  }
};

module.exports = {
  createLedger,
  getLedgerById,
  getUserLedgers,
  updateLedger,
  deleteLedger,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
  generateSettlementTransactions,
  getLedgerBalance
};
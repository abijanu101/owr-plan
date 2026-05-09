const Ledger = require('../models/Ledgers');

const createLedger = async (req, res) => {
  try {
    const ledger = await Ledger.create({
      ...req.body,
      userId: req.user?._id || req.body.userId
    });
    res.status(201).json({
      success: true,
      data: { ledger }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getLedgerById = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }
    res.status(200).json({
      success: true,
      data: { ledger }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserLedgers = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;
    const ledgers = await Ledger.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { ledgers }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      success: true,
      data: { ledger }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteLedger = async (req, res) => {
  try {
    await Ledger.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: `Ledger ${req.params.id} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addExpense = async (req, res) => {
  res.status(201).json({
    success: true,
    data: { expense: { id: 'dummy-expense', ...req.body } }
  });
};

const updateExpense = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { expense: { id: req.params.expenseId, ...req.body } }
  });
};

const deleteExpense = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Expense ${req.params.expenseId} deleted successfully`
  });
};

const getExpenses = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { expenses: [] }
  });
};

const generateSettlementTransactions = async (req, res) => {
  const { name, icon, amount, people, transactions, date } = req.body;
  
  if (!people || people.length === 0) {
    return res.status(400).json({ success: false, message: 'No people provided' });
  }

  // 1. Calculate Settlements
  const sortedPeople = [...people].sort();
  let peopleCount = sortedPeople.length;
  let equalshare = Number(amount) / peopleCount;

  let personMap = new Map();
  for (let i = 0; i < peopleCount; i++) {
    personMap.set(sortedPeople[i], i);
  }

  let settlements = new Array(peopleCount).fill(0);
  for (let transaction of transactions) {
    let indexPayer = personMap.get(transaction.from);
    if (indexPayer !== undefined) {
      settlements[indexPayer] += Number(transaction.amount);
    }

    if (transaction.to !== 'External Vendor') {
      let indexReciever = personMap.get(transaction.to);
      if (indexReciever !== undefined) {
        settlements[indexReciever] -= Number(transaction.amount);
      }
    }
  }

  for (let i = 0; i < peopleCount; i++) {
    settlements[i] -= equalshare;
  }

  let negative = [];
  let positive = [];
  for (let i = 0; i < peopleCount; i++) {
    let balance = Math.round(settlements[i] * 100) / 100;
    if (balance < 0) {
      negative.push({ person: sortedPeople[i], amount: balance });
    } else if (balance > 0) {
      positive.push({ person: sortedPeople[i], amount: balance });
    }
  }

  let settlementTransactions = [];
  for (let i = 0; i < positive.length; i++) {
    for (let j = 0; j < negative.length; j++) {
      if (negative[j].amount === 0) continue;

      let settlement_amount = Math.min(positive[i].amount, -negative[j].amount);
      settlement_amount = Math.round(settlement_amount * 100) / 100;

      if (settlement_amount > 0) {
        settlementTransactions.push({
          from: negative[j].person,
          to: positive[i].person,
          amount: settlement_amount
        });

        positive[i].amount -= settlement_amount;
        negative[j].amount += settlement_amount;
      }

      if (positive[i].amount === 0) break;
    }
  }

  // 2. Save to Database
  try {
    const { id } = req.body;
    let ledger;

    if (id) {
      ledger = await Ledger.findById(id);
      if (!ledger) {
        return res.status(404).json({ success: false, message: 'Ledger not found' });
      }
      
      ledger.name = name || ledger.name;
      ledger.icon = icon || ledger.icon;
      ledger.amount = Number(amount) || ledger.amount;
      ledger.date = date || ledger.date;
      ledger.people = people || ledger.people;
      ledger.initialTransactions = transactions || ledger.initialTransactions;
      ledger.settlementTransactions = settlementTransactions;
      ledger.status = 'pending'; // Reset to pending if modified
    } else {
      ledger = new Ledger({
        userId: req.user ? req.user._id : req.body.userId, 
        name: name || 'Unnamed Ledger',
        icon: icon || 'food',
        amount: Number(amount) || 0,
        date: date || Date.now(),
        people: people,
        initialTransactions: transactions,
        settlementTransactions: settlementTransactions,
        status: 'pending'
      });
    }

    await ledger.save();

    return res.status(id ? 200 : 201).json({
      success: true,
      data: { 
        ledger: ledger,
        settlementTransactions 
      }
    });
  } catch (error) {
    console.error('Error saving ledger:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save ledger to database',
      error: error.message 
    });
  }
};

const toggleSettlementStatus = async (req, res) => {
  try {
    const { id, settlementId } = req.params;
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Ledger not found' });
    }

    const settlement = ledger.settlementTransactions.id(settlementId);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    settlement.paid = !settlement.paid;
    
    // Auto-update global status if all settlements are paid
    const allPaid = ledger.settlementTransactions.every(s => s.paid);
    ledger.status = allPaid ? 'settled' : 'pending';

    await ledger.save();
    res.status(200).json({
      success: true,
      data: { ledger }
    });
  } catch (err) {
    console.error('Toggle settlement error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getLedgerBalance = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { balance: 0 }
  });
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
  toggleSettlementStatus,
  getLedgerBalance
};
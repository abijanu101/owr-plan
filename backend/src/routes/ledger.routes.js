const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ledgerController');

const { protect } = require('../middlewares/auth.middleware');

// Routes for ledger operations
router.post('/', protect, createLedger);
router.post('/settle', protect, generateSettlementTransactions);
router.get('/my', protect, getUserLedgers);
router.get('/:id', protect, getLedgerById);
router.put('/:id', protect, updateLedger);
router.delete('/:id', protect, deleteLedger);

// Routes for expense operations
router.post('/:id/expenses', protect, addExpense);
router.get('/:id/expenses', protect, getExpenses);
router.put('/:id/expenses/:expenseId', protect, updateExpense);
router.delete('/:id/expenses/:expenseId', protect, deleteExpense);

// Routes for ledger analytics
router.get('/:id/balance', protect, getLedgerBalance);
router.patch('/:id/settlements/:settlementId', protect, toggleSettlementStatus);
// router.get('/:id/settlements', generateSettlementTransactions); // Old route

module.exports = router;
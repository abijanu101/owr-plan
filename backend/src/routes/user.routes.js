const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Routes for user operations
router.post('/', registerUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
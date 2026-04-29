const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getCurrentUser);
router.post('/logout', logoutUser);

module.exports = router;

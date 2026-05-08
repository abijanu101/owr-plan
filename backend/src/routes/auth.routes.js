const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth.middleware');

// Routes for authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', (req, res, next) => {
  const { extractToken } = require('../utils/jwt');
  const token = extractToken(req);
  if (!token) {
    return res.status(200).json({ success: false, message: 'Not authenticated' });
  }
  next();
}, protect, getCurrentUser);
router.post('/logout', protect, logoutUser);

module.exports = router;
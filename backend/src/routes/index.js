const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const entityRoutes = require('./entity.routes');
const iconRoutes = require('./icon.routes');
const activityRoutes = require('./activity.routes');
const ledgerRoutes = require('./ledger.routes');
const planRoutes = require('./plan.routes');

// Mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/entities', entityRoutes);
router.use('/icons', iconRoutes);
router.use('/activities', activityRoutes);
router.use('/ledgers', ledgerRoutes);
router.use('/plan', planRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
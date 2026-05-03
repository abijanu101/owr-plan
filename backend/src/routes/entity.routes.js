const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  createEntity,
  getEntityById,
  getEntitiesByUser,
  updateEntity,
  deleteEntity,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupMembers, 
  editProfile, 
  viewSchedule, 
  getActivitiesForEntity
} = require('../controllers/entityController');

// Routes for entity operations
router.use(protect); // 👈 PROTECT ALL ROUTES BELOW

router.post('/', createEntity);
router.get('/', getEntitiesByUser);
router.get('/user/:userId', getEntitiesByUser);
router.get('/:id', getEntityById);
router.put('/:id', updateEntity);
router.delete('/:id', deleteEntity);
router.get('/:id/activities', getActivitiesForEntity);

// Routes for group member operations
router.post('/:id/members', addMemberToGroup);
router.delete('/:id/members/:memberId', removeMemberFromGroup);
router.get('/:id/members', getGroupMembers);

router.post('/:id/editProfile', editProfile);
router.get('/:id/schedule', viewSchedule);

module.exports = router;
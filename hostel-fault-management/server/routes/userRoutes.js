const express = require('express');
const router = express.Router();
const { getEmployees, getAllUsers, updateUserRole, deleteUser, getMe, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/employees', protect, adminOnly, getEmployees);
router.get('/all', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
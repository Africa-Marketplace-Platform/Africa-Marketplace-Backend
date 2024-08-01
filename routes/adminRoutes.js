const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/adminController');

// Only admins can manage users
router.get('/users', auth('admin'), getAllUsers);
router.delete('/user/:id', auth('admin'), deleteUser);

module.exports = router;

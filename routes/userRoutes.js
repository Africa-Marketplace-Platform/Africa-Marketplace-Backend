const express = require('express');
const { updateUserProfile, reportContent } = require('../controllers/userController');
const auth = require('../middleware/auth'); // Middleware to protect routes

const router = express.Router();

// Route to update user profile
router.put('/profile', auth, updateUserProfile);

// Route to report content
router.post('/report', auth, reportContent);

module.exports = router;

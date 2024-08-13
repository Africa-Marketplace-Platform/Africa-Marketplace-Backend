const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser, reportContent, getReports, handleReport } = require('../controllers/adminController');

// Only admins can manage users and view reports
router.get('/users', protect, authorize(['admin']), getAllUsers);

// Only admins can delete users
router.delete('/user/:id', protect, authorize(['admin']), deleteUser);

// Any authenticated user can report content
router.post('/report', protect, reportContent);

// Only admins can view all reports
router.get('/reports', protect, authorize(['admin']), getReports);

// Only admins can handle (update the status of) a report
router.put('/report/:id', protect, authorize(['admin']), handleReport);

module.exports = router;

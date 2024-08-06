// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser, reportContent, getReports, handleReport } = require('../controllers/adminController');

// Only admins can manage users and reports
router.get('/users', protect, authorize(['admin']), getAllUsers);
router.delete('/user/:id', protect, authorize(['admin']), deleteUser);
router.post('/report', protect, reportContent);
router.get('/reports', protect, authorize(['admin']), getReports);
router.put('/report/:id', protect, authorize(['admin']), handleReport);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  reportContent,
  getReports,
  handleReport,
} = require("../controllers/adminController");
const {
    getAllUsers,
    updateUser,
    deleteUser,
  } = require('../controllers/userController');
  const {
    getAllBusinesses,
    adminUpdateBusiness,
    adminDeleteBusiness,
  } = require('../controllers/businessController');

  

  // Admin routes to manage users
router.get('/users', protect, authorize(['admin']), getAllUsers);
router.put('/users/:id', protect, authorize(['admin']), updateUser);
router.delete('/users/:id', protect, authorize(['admin']), deleteUser);

// Admin routes to manage businesses
router.get('/businesses', protect, authorize(['admin']), getAllBusinesses);
router.put('/businesses/:id', protect, authorize(['admin']), adminUpdateBusiness);
router.delete('/businesses/:id', protect, authorize(['admin']), adminDeleteBusiness);



// Any authenticated user can report content
router.post("/report", protect, reportContent);

// Only admins can view all reports
router.get("/reports", protect, authorize(["admin"]), getReports);

// Only admins can handle (update the status of) a report
router.put("/report/:id", protect, authorize(["admin"]), handleReport);

module.exports = router;

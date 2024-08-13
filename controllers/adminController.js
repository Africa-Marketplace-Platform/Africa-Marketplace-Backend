const User = require('../models/User');
const Report = require('../models/Report');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v'); // Exclude password and version fields
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await user.remove();
    res.json({ message: 'User removed successfully.' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Report content
exports.reportContent = async (req, res) => {
  const { contentId, contentModel, reason } = req.body;

  try {
    if (!contentId || !contentModel || !reason) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const report = new Report({
      contentId,
      contentModel,
      reason,
      reporter: req.user.id,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('Report content error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'name email').exec();
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Handle a report
exports.handleReport = async (req, res) => {
  const { reportId, status } = req.body;

  try {
    if (!reportId || !status) {
      return res.status(400).json({ message: 'Report ID and status are required.' });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Validate status
    const validStatuses = ['pending', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    report.status = status;
    await report.save();

    res.json({ message: 'Report status updated successfully.', report });
  } catch (error) {
    console.error('Handle report error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

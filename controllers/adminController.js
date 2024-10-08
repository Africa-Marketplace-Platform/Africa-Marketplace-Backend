const User = require('../models/User');
const Report = require('../models/Report');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v'); // Exclude password and version fields
    res.status(200).json({
      message: 'Users retrieved successfully.',
      users,
    });
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve users.' });
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
    res.status(200).json({ message: 'User removed successfully.' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error. Failed to remove user.' });
  }
};

// Report content
exports.reportContent = async (req, res) => {
  const { contentId, contentModel, reason, description } = req.body;

  try {
    if (!contentId || !contentModel || !reason) {
      return res.status(400).json({ message: 'Content ID, model, and reason are required.' });
    }

    const report = new Report({
      contentId,
      contentModel,
      reason,
      description: description || '', // Optional description
      reporter: req.user.id,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('Report content error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to submit report.' });
  }
};

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'name email').exec();
    res.status(200).json({
      message: 'Reports retrieved successfully.',
      reports,
    });
  } catch (error) {
    console.error('Get reports error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve reports.' });
  }
};

// Handle a report
exports.handleReport = async (req, res) => {
  const { reportId, status, adminNote } = req.body;

  try {
    if (!reportId || !status) {
      return res.status(400).json({ message: 'Report ID and status are required.' });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Validate status
    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    report.status = status;
    report.adminNote = adminNote || ''; // Optional admin note
    await report.save();

    res.status(200).json({ message: 'Report status updated successfully.', report });
  } catch (error) {
    console.error('Handle report error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to update report status.' });
  }
};

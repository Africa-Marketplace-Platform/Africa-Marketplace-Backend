const User = require('../models/User');
const Report = require('../models/Report');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Report content
exports.reportContent = async (req, res) => {
  const { contentId, contentModel, reason } = req.body;

  try {
    const report = new Report({
      contentId,
      contentModel,
      reason,
      reporter: req.user.id
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('Report error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Get all reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'name email');
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
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    await report.save();

    res.json({ message: 'Report status updated.' });
  } catch (error) {
    console.error('Handle report error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

const User = require('../models/User');
const Report = require('../models/Report');
const bcrypt = require('bcryptjs'); // To handle password hashing

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(req.user.id);

    if (user) {
      // Update name and email if provided
      user.name = name || user.name;
      user.email = email || user.email;

      // Hash new password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      // Save updated user
      const updatedUser = await user.save();

      // Respond with updated user info
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        premium: updatedUser.premium,
        wishlistProducts: updatedUser.wishlistProducts,
        wishlistServices: updatedUser.wishlistServices,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Report content
exports.reportContent = async (req, res) => {
  const { contentId, contentModel, reason, description } = req.body;

  try {
    // Validate request body
    if (!contentId || !contentModel || !reason) {
      return res.status(400).json({ message: 'Content ID, model, and reason are required.' });
    }

    // Create a new report
    const report = new Report({
      contentId,
      contentModel,
      reason,
      description: description || '', // Optional description
      reporter: req.user.id,
    });

    // Save the report to the database
    await report.save();

    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('Report content error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

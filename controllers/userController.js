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
        message: 'User profile updated successfully.',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          premium: updatedUser.premium,
          wishlistProducts: updatedUser.wishlistProducts,
          wishlistServices: updatedUser.wishlistServices,
          followingBusinesses: updatedUser.followingBusinesses, // Added
          followingInfluencers: updatedUser.followingInfluencers, // Added
        },
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error. Could not update user profile.' });
  }
};

// Follow or unfollow a business
exports.followBusiness = async (req, res) => {
  const { businessId } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user.followingBusinesses.includes(businessId)) {
      // If the business is already followed, unfollow it
      user.followingBusinesses = user.followingBusinesses.filter(id => id.toString() !== businessId);
      await user.save();
      res.json({ message: 'Business unfollowed successfully.' });
    } else {
      // If the business is not followed, follow it
      user.followingBusinesses.push(businessId);
      await user.save();
      res.json({ message: 'Business followed successfully.' });
    }
  } catch (error) {
    console.error('Error following/unfollowing business:', error.message);
    res.status(500).json({ message: 'Server error. Could not follow/unfollow business.' });
  }
};

// Follow or unfollow an influencer
exports.followInfluencer = async (req, res) => {
  const { influencerId } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user.followingInfluencers.includes(influencerId)) {
      // If the influencer is already followed, unfollow them
      user.followingInfluencers = user.followingInfluencers.filter(id => id.toString() !== influencerId);
      await user.save();
      res.json({ message: 'Influencer unfollowed successfully.' });
    } else {
      // If the influencer is not followed, follow them
      user.followingInfluencers.push(influencerId);
      await user.save();
      res.json({ message: 'Influencer followed successfully.' });
    }
  } catch (error) {
    console.error('Error following/unfollowing influencer:', error.message);
    res.status(500).json({ message: 'Server error. Could not follow/unfollow influencer.' });
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
    console.error('Error reporting content:', error.message);
    res.status(500).json({ message: 'Server error. Could not submit the report.' });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ message: 'Users retrieved successfully.', users });
  } catch (err) {
    console.error('Error retrieving users:', err.message);
    res.status(500).json({ message: 'Server error. Could not retrieve users.' });
  }
};

// Update any user's role or info (Admin only)
exports.updateUser = async (req, res) => {
  const { role, name, email, premium } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role || user.role;
    user.name = name || user.name;
    user.email = email || user.email;
    user.premium = premium !== undefined ? premium : user.premium;

    await user.save();
    res.status(200).json({ message: 'User updated successfully.', user });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ message: 'Server error. Could not update user.' });
  }
};

// Delete any user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await user.remove();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Server error. Could not delete user.' });
  }
};

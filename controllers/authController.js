const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

// Register new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user = new User({ name, email, password, verificationToken });

    await user.save();

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    const message = `Please verify your email by clicking on the following link: ${verificationUrl}`;

    await sendEmail(email, 'Email Verification', message);

    res.status(200).json({ message: 'Verification email sent successfully.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error. Registration failed.' });
  }
};

// Email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Email verification error:', err.message);
    res.status(500).json({ message: 'Server error. Email verification failed.' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified.' });
    }

    const token = generateToken(user.id);
    res.status(200).json({ message: 'Login successful.', token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Login failed.' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset/${resetToken}`;
    const message = `Please click on the following link to reset your password: ${resetUrl}`;

    await sendEmail(email, 'Password Reset', message);

    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error. Failed to send password reset email.' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error. Password reset failed.' });
  }
};

// Social media login callbacks
exports.googleCallback = (req, res) => {
  res.status(200).json({ message: 'Google login successful.' });
};

exports.facebookCallback = (req, res) => {
  res.status(200).json({ message: 'Facebook login successful.' });
};

exports.twitterCallback = (req, res) => {
  res.status(200).json({ message: 'Twitter login successful.' });
};

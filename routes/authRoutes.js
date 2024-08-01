const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  googleCallback,
  facebookCallback,
  twitterCallback,
} = require('../controllers/authController');

// Local authentication routes
router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset/:token', resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), facebookCallback);

// Twitter OAuth routes
router.get('/twitter', passport.authenticate('twitter', { scope: ['email'] }));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), twitterCallback);

module.exports = router;

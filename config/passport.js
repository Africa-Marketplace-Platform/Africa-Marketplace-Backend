const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const { id, displayName, emails } = profile;
  try {
    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = new User({
        googleId: id,
        name: displayName,
        email: emails[0].value,
        isVerified: true,
        password: 'N/A',  // No password required for OAuth users
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
  const { id, displayName, emails } = profile;
  try {
    let user = await User.findOne({ facebookId: id });
    if (!user) {
      user = new User({
        facebookId: id,
        name: displayName,
        email: emails ? emails[0].value : `${id}@facebook.com`,
        isVerified: true,
        password: 'N/A',  // No password required for OAuth users
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: '/api/auth/twitter/callback',
  includeEmail: true
}, async (token, tokenSecret, profile, done) => {
  const { id, displayName, emails } = profile;
  try {
    let user = await User.findOne({ twitterId: id });
    if (!user) {
      user = new User({
        twitterId: id,
        name: displayName,
        email: emails[0].value,
        isVerified: true,
        password: 'N/A',  // No password required for OAuth users
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

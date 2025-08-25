const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Helper function to check if user exists with email
async function checkExistingUserWithEmail(email) {
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser && existingUser.authProvider) {
      return {
        exists: true,
        provider: existingUser.authProvider
      };
    }
    return { exists: false };
  } catch (error) {
    console.error('Error checking existing user:', error);
    return { exists: false };
  }
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        
        // Check if user exists with this email
        const checkResult = await checkExistingUserWithEmail(email);
        if (checkResult.exists && checkResult.provider !== 'google') {
          return done(null, false, { 
            message: `Please use your ${checkResult.provider} credentials to login`,
            provider: checkResult.provider
          });
        }

        const userData = {
          email,
          name: profile.displayName,
          avatar: profile.photos[0]?.value || '',
          provider: 'google',
          providerId: profile.id,
          username: profile.username || email.split('@')[0]
        };

        const user = await User.createOrUpdate(userData);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        
        // Check if user exists with this email
        const checkResult = await checkExistingUserWithEmail(email);
        if (checkResult.exists && checkResult.provider !== 'github') {
          return done(null, false, { 
            message: `Please use your ${checkResult.provider} credentials to login`,
            provider: checkResult.provider
          });
        }

        const userData = {
          email,
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value || '',
          provider: 'github',
          providerId: profile.id,
          username: profile.username
        };

        const user = await User.createOrUpdate(userData);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

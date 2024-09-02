import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../schema/User.js';



dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, cb) => {
    const newUser = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      
    };
    console.log(profile);

    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        
        cb(null, user);
      } else {
        user = await User.create(newUser);
        cb(null, user);
      }
    } catch (err) {
      console.error(err);
    }
  }
));
passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../schema/User.js';
import '../middleware/passport.js';
import { baseurl } from '../config/config.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: baseurl }),
  async function(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.redirect(`${baseurl}`);
      }

      // Create a new session for the user
      req.session.regenerate((err) => {
        if (err) {
          console.error('Error regenerating session:', err);
          return res.status(500).json({ error: 'Session error' });
        }

        const token = jwt.sign({ userid: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Generated token:', token);

        if (!token) {
          return res.status(404).json({ message: 'Token not found' });
        }

        res.cookie('jwt', token, { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production', 
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
          path: '/' 
        });
        
        res.cookie('userid', user._id.toString(), { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production', 
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
          path: '/' 
        });
        
        req.session.user = user;
        console.log('Session user:', req.session.user);

        // Redirect based on profile completion status
        if (user.isProfileComplete) {
          res.redirect(`${baseurl}/userhome`);
        } else {
          res.redirect(`${baseurl}/personaldetail`);
        }

      });
    } catch (error) {
      console.error(error);
      res.redirect(`${baseurl}`);
    }
  }
);

export default router;

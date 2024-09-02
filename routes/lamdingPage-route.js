import express from 'express';
import User from '../schema/User.js';
import PersonalDetail from '../schema/PersonalDetail.js';
import crypto from 'crypto';


const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email or phone.' });
      }
  
      // Create new user
      const newUser = new User({ name, email, phone, password });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user.', error });
    }
  } );

  router.post('/generate-otp',async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      // Store OTP in user's profile or a separate collection
      user.otp = otp;
      await user.save();
  
      // Send OTP via email
      await sendOTPEmail(email, otp);
  
      res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (error) {
      res.status(500).json({ message: 'Error generating OTP.', error });
    }
  } )

  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({ email, otp });
      if (!user) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }
  
      user.isProfileComplete = true;
      user.otp = undefined; // Clear OTP after verification
      await user.save();
  
      res.status(200).json({ message: 'OTP verified. Registration complete.' });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying OTP.', error });
    }
  });

export default router;
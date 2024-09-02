import express from 'express';
import mongoose from 'mongoose';
import User from '../schema/User.js';
import PersonalDetail from '../schema/PersonalDetail.js';
import Request from '../schema/Request.js';
import authenticateJWT from '../middleware/Authtoken.js';

const router = express.Router();

// Route to get user profiles based on filters
router.get('/profiles', authenticateJWT, async (req, res) => {
    try {
        const { filterType, filterValue, gender } = req.query;
        const userId = req.user._id; // Get the signed-in user's ID
        console.log(userId)
        // Build the query based on filters
        let query = { userId: { $ne: userId } }; // Exclude the signed-in user's profile
        if (gender) {
            query['interestedIn'] = gender;
        }
        if (filterType && filterValue) {
            query[filterType] = filterValue;
        }
        
        // Fetch profiles and populate the userId field with name and email
        const profiles = await PersonalDetail.find(query).populate('userId', 'name email');

        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

router.get('/profiles/:userId', async (req, res) => {
    
    try {
        const { userId } = req.params;
        console.log('user id:', userId);
        const user = await PersonalDetail.findOne({userId}).populate('userId', 'name email');
        console.log('user found:', user);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: "Server error" });
      }
  });


  router.get('/checkRequestStatus/:userId', authenticateJWT, async (req, res) => {
    const { userId } = req.params; // The userId of the user whose profile is being viewed
    const requesterId = req.user._id; // The userId of the logged-in user

    try {
        // Find the request document of the logged-in user
        const userRequest = await Request.findOne({ userId: requesterId });
        console.log('a', userRequest);

        // Find the request document of the viewed user
        const viewedUserRequest = await Request.findOne({ userId: userId });
        console.log('b', viewedUserRequest);

        if (!userRequest || !viewedUserRequest) {
            return res.status(404).json({ message: 'Request data not found.' });
        }

        // Check if the viewed userId exists in the requestAcceptIds array of the logged-in user
        const hasUserAccepted = userRequest.requestAcceptIds.some(accept => accept.userId.equals(new mongoose.Types.ObjectId(userId)));
        console.log('1', hasUserAccepted);

        // Check if the requesterId exists in the requestAcceptIds array of the viewed user
        const hasViewedUserAccepted = viewedUserRequest.requestAcceptIds.some(accept => accept.userId.equals(new mongoose.Types.ObjectId(requesterId)));
        console.log('2', hasViewedUserAccepted);

        // If either has accepted the request, return true
        const isAccepted = hasUserAccepted || hasViewedUserAccepted;
        console.log('isAccepted', isAccepted);

        res.json({ isAccepted });
    } catch (error) {
        console.error('Error checking request status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


export default router;

import express from 'express';
import User from '../schema/User.js';
import ShortList from '../schema/ShortList.js';
import PersonalDetail from '../schema/PersonalDetail.js';
import authenticateJWT from '../middleware/Authtoken.js';
// import updateLastActive from '../middleware/updateLastActive.js';


const router = express.Router();


// Shortlist a profile
router.post('/shortlist/:userId', authenticateJWT,  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      console.log('logged in user:',loggedInUserId)
      const { userId } = req.params;
      console.log('shortlisted profile:',userId)
  
     
      let loggedInUserShortList = await ShortList.findOne({ userId: loggedInUserId });
      if (!loggedInUserShortList) {
        loggedInUserShortList = new ShortList({ userId: loggedInUserId, shortListedIds: [], shortListedByIds: [] });
      }
  
      
      let targetUserShortList = await ShortList.findOne({ userId: userId });
      if (!targetUserShortList) {
        targetUserShortList = new ShortList({ userId: userId, shortListedIds: [], shortListedByIds: [] });
      }
  
      
      loggedInUserShortList.shortListedIds.addToSet(userId);
      targetUserShortList.shortListedByIds.addToSet(loggedInUserId);
  
     
      await loggedInUserShortList.save();
      await targetUserShortList.save();
  
      res.status(200).send('Profile shortlisted');
    } catch (error) {
      console.error('Error shortlisting profile:', error);
      res.status(500).send('Error shortlisting profile');
    }
  });

  router.get('/shortlisted', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the request record where the user is the sender
        const shortlist = await ShortList.findOne({ userId }).select('shortListedIds');

        if (!shortlist) {
            console.log(`No shortlist record found for user: ${userId}`);
            return res.status(404).json({ message: 'No shortlist found.' });
        }

        const shortlistedIds = shortlist.shortListedIds || [];

        if (shortlistedIds.length === 0) {
            console.log(`No shortlisted profiles for user: ${userId}`);
            return res.status(404).json({ message: 'No shorlisted profiles found.' });
        }

        // Fetch personal details and user details separately
        const personalDetails = await PersonalDetail.find({ userId: { $in: shortlistedIds } }).select('profilePicUrl userId');
        const users = await User.find({ _id: { $in: shortlistedIds } }).select('name');

        // Combine user information with their personal details
        const shortList = shortlistedIds.map(id => {
            const detail = personalDetails.find(pd => pd.userId.toString() === id.toString());
            const user = users.find(u => u._id.toString() === id.toString());
            return {
                userId: id,
                name: user ? user.name : 'Unknown',
                profilePicUrl: detail ? detail.profilePicUrl : ''
            };
        });

        res.status(200).json({ shortList });
    } catch (error) {
        console.error('Error fetching shortlisted profiles:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
  export default router;
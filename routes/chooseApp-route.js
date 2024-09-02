import express from 'express';
import PersonalDetail from '../schema/PersonalDetail.js';
import User from '../schema/User.js';
import authenticateJWT from '../middleware/Authtoken.js';

const router = express.Router();

router.post('/chooseapp', authenticateJWT, async (req, res) => {
  try {
    const { selectedOption } = req.body;

    if (!selectedOption) {
      return res.status(400).json({ error: 'No option selected' });
    }

    // Update the user's PersonalDetail with the selected option
    await PersonalDetail.findOneAndUpdate(
      { userId: req.user._id }, // Find the document by user ID
      { interestedIn: selectedOption }, // Add a new field `interestedIn` to store the selected option
      { new: true, upsert: true } // Create a new document if it doesn't exist
    );

    // Mark the user's profile as complete
    await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true });

    res.status(200).json({ message: 'Option saved successfully' });
  } catch (error) {
    console.error('Error saving selected option:', error);
    res.status(500).json({ error: 'Failed to save option. Please try again later.' });
  }
});

export default router;

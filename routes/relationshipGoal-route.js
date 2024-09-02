import express from 'express';
import PersonalDetail from '../schema/PersonalDetail.js';
import authenticateJWT from '../middleware/Authtoken.js';

const router = express.Router();

router.post('/relationship-goals', authenticateJWT, async (req, res) => {
  try {
    const { relationshipGoal } = req.body;
    const userId = req.user._id;

    // Find the existing personal detail record or create a new one
    const personalDetail = await PersonalDetail.findOneAndUpdate(
      { userId }, // Filter by userId
      { relationshipGoal }, // Update the relationshipGoal field
      { new: true, upsert: true } // Return the updated document and create it if it doesn't exist
  );
    res.status(200).json({ message: 'Relationship goal saved successfully!' });
  } catch (error) {
    console.error('Error saving relationship goal:', error.message);
    res.status(500).json({ error: 'Failed to save relationship goal. Please try again later.' });
  }
});

export default router;

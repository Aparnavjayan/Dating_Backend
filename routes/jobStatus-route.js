import express from 'express';
import PersonalDetail from '../schema/PersonalDetail.js';
import authenticateJWT from '../middleware/Authtoken.js';

const router = express.Router();

router.post('/jobstatus', authenticateJWT, async (req, res) => {
  try {
    const {
      companyName,
      designation,
      location,
      jobTitle,
      expertiseLevel,
    } = req.body;

    // Validate required fields
    // if (!jobTitle && !companyName) {
    //   return res.status(400).json({ error: 'Job title or company name is required.' });
    // }

    const updatedDetail = await PersonalDetail.findOneAndUpdate(
      { userId: req.user._id }, // Filter by userId
      {
          companyName,
          designation,
          location,
          jobTitle,
          expertiseLevel
      },
      { new: true, upsert: true } // Return the updated document and create it if it doesn't exist
  );
    res.status(200).json({ message: 'Job status saved successfully!' });
  } catch (error) {
    console.error('Error saving job status:', error.message);
    res.status(500).json({ error: 'Failed to save job status. Please try again later.' });
  }
});

export default router;

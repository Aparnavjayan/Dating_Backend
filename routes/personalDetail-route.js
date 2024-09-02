import express from 'express';
import PersonalDetail from '../schema/PersonalDetail.js';
import upload from '../config/cloudinaryConfig.js';
import authenticateToken from '../middleware/Authtoken.js'; // Import the auth middleware

const router = express.Router();

// Function to handle file uploads and return URLs
const handleFileUploads = (files) => {
  return {
    profilePicUrl: files['profilePic']?.[0]?.path || null,
    additionalImages: files['additionalImages'] ? files['additionalImages'].map(file => file.path) : [],
    shortReelUrl: files['shortReel']?.[0]?.path || null,
  };
};

// Function to validate required fields
const validatePersonalDetails = ({ age, dob }) => {
  if (!age || !dob) {
    throw new Error('Age and DOB are required fields.');
  }
};

// Route to handle personal details submission
router.post('/personaldetail', authenticateToken, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'additionalImages', maxCount: 3 },
  { name: 'shortReel', maxCount: 1 },
]), async (req, res) => {
  try {
    const { age, dob, hobbies, interests, smokingHabits, drinkingHabits, qualifications } = req.body;

    // Validate required fields
    validatePersonalDetails({ age, dob });

    // Handle file uploads
    const { profilePicUrl, additionalImages, shortReelUrl } = handleFileUploads(req.files);

    // Create and save a new PersonalDetail document
    const personalDetail = new PersonalDetail({
      userId: req.user.id, // Set userId from the authenticated user
      age,
      dob,
      hobbies,
      interests,
      smokingHabits,
      drinkingHabits,
      qualifications,
      profilePicUrl,
      additionalImages,
      shortReelUrl,
    });

    await personalDetail.save();

    // Respond with a success message
    res.status(200).json({ message: 'Details saved successfully!' });

  } catch (error) {
    console.error('Error saving personal details:', error.message);  // Log the error for debugging
    res.status(500).json({ error: error.message || 'Failed to save details. Please try again later.' });
  }
});

export default router;

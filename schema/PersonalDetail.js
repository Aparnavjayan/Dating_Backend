import mongoose from 'mongoose';

const PersonalDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  age: { type: Number, required: false },
  dob: { type: String, required: false },
  hobbies: { type: String, required: false },
  interests: { type: String, required: false },
  smokingHabits: { type: String, required: false },
  drinkingHabits: { type: String, required: false },
  qualifications: { type: String, required: false },
  profilePicUrl: { type: String, required: false },
  additionalImages: [String],
  shortReelUrl: { type: String },
  companyName: { type: String },   
  designation: { type: String },   
  location: { type: String },      
  jobTitle: { type: String },      
  expertiseLevel: { type: String },
  relationshipGoal: { type: String, enum: ['shortTerm', 'longTerm'] },
  interestedIn: { type: String },
});

const PersonalDetail =mongoose.model('PersonalDetail', PersonalDetailSchema);
export default PersonalDetail;

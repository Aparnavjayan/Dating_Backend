import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  Participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  Messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Messages',
  }],
});

const Conversations = mongoose.model('Conversations', ConversationSchema);
export default Conversations;

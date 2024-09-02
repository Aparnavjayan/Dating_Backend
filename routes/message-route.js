import express from 'express';
import authenticateJWT from '../middleware/Authtoken.js';
import Message from '../schema/Message.js';
import User from '../schema/User.js';

const router = express.Router();

router.post('/messages', authenticateJWT,  async (req, res) => {
    try {
      const { receiver, content } = req.body;
      const message = new Message({
        sender: req.user.id,
        receiver,
        content
      });
  
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  router.get('/messages/:userId', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log('logged in user')
      const otherUserId = req.params.userId;
      console.log('other user',otherUserId)
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ]
      }).sort({ timestamp: 1 });
      console.log('message(2)',)
      res.json(messages);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  //to fetch the user data
  router.get('/fetchuser/:userId', authenticateJWT, async (req, res) => {
    console.log('hi')
    try {
      const userId = req.params.userId;
      console.log('user id:',userId)
      const user = await User.findById(userId);
      console.log('messaging user:',user)
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  export default router;
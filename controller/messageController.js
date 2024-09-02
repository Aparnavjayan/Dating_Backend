import Conversations from '../schema/Conversations.js';
import Messages from '../schema/Messages.js';
import AsyncHandler from '../middleware/AsyncHandler.js';
import { getReceiverSocketId ,io } from '../socket/socket.js';
//import { io } from '../socket/socket.js';

export const sendMessage = AsyncHandler(async (req, res, next) => {
  const { receiverId } = req.params;
  const { message, isImage } = req.body;
  const senderId = req.id;

  let conversation = await Conversations.findOne({
    Participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversations.create({
      Participants: [senderId, receiverId],
    });
  }

  const newMessage = new Messages({
    senderId,
    receiverId,
    message,
    isImage,
  });

  await newMessage.save();
  conversation.Messages.push(newMessage._id);
  await conversation.save();

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('newMessage', newMessage);
  }

  return res.status(201).json({ newMessage });
});

export const getMessages = AsyncHandler(async (req, res, next) => {
  const { userToChat } = req.params;
  const userId = req.id;
  const conversation = await Conversations.findOne({
    Participants: { $all: [userId, userToChat] },
  }).populate('Messages');

  if (!conversation) return res.status(200).json([]);

  return res.status(200).json({ messages: conversation.Messages });
});

export const getConversations = AsyncHandler(async (req, res, next) => {
  const userId = req.id;
  let conversations = await Conversations.find({
    Participants: { $in: [userId] },
  }).populate('Participants');

  conversations = conversations.map((each) => {
    each.Participants = each.Participants.filter(item => item._id != userId);
    return each;
  });

  return res.json({ conversations });
});

export const getUserId = AsyncHandler(async (req, res, next) => {
  const userId = req.id;
  return res.json({ userId });
});

import { Server as SocketIoServer } from 'socket.io';
import Message from '../database/Message.js';

export const initializeSocket = (server) => {
  const io = new SocketIoServer(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User joined room: ${userId}`);
    });

    socket.on('sendMessage', async (messageData) => {
      const { sender, receiver, content } = messageData;
      const message = new Message({ sender, receiver, content });
      await message.save();
      io.to(receiver).emit('receiveMessage', message);
      io.to(sender).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

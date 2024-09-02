import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';

import GoogleAuth from './routes/googleAuthentication-route.js';
import personalDetailRoute from './routes/personalDetail-route.js';
import jobstatusRoute from './routes/jobStatus-route.js';
import relationshipGoal from './routes/relationshipGoal-route.js';
import chooseAppRoute from './routes/chooseApp-route.js';
import fetchProfileRoute from './routes/fetchProfiles-route.js';
import shortlistRoute from './routes/shortlist-route.js';
import requestRoute from './routes/request-route.js';
import messageRoute from './routes/message-route.js';

dotenv.config();
const app = express();

// Create the HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new SocketIoServer(server, {
  cors: {
    origin: 'http://localhost:3000', // Ensure this matches your client URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware Setup
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(cookieParser());

// Route Setup
app.use(GoogleAuth);
app.use('/api', personalDetailRoute);
app.use('/api', jobstatusRoute);
app.use('/api', relationshipGoal);
app.use('/api', chooseAppRoute);
app.use('/api', fetchProfileRoute);
app.use('/api', shortlistRoute);
app.use('/api', requestRoute);
app.use('/api', messageRoute);

// Socket.IO Event Handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Event handlers can be defined here
  socket.on('join', (userId) => {
    console.log(`User with ID ${userId} joined.`);
    socket.join(userId); // Join room by userId
  });

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    // Emit to the receiver's room
    io.to(message.receiver).emit('receiveMessage', message);
    // Optionally, emit the message back to the sender's room too, if not already added
    io.to(message.sender).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});




// Start Server
server.listen(3001, () => console.log('Server started on port 3001'));

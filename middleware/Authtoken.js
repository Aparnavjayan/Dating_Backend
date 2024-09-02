import jwt from 'jsonwebtoken';
import User from '../schema/User.js';
import dotenv from 'dotenv';
dotenv.config();

const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.jwt;
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Token not found' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ message: 'Server configuration error' });
  }
  
  try {
    console.log('Before verification');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userid);
    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized, user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};



export default authenticateJWT;

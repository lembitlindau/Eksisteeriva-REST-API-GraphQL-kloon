const jwt = require('jsonwebtoken');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const createContext = async ({ req }) => {
  let user = null;
  
  // Get token from Authorization header
  const authorization = req.headers.authorization;
  
  if (authorization) {
    const token = authorization.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      user = await User.findById(decoded.userId);
    } catch (error) {
      // Token is invalid, user remains null
      console.warn('Invalid token:', error.message);
    }
  }
  
  return {
    user,
    isAuthenticated: !!user
  };
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const requireAuth = (user) => {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

module.exports = {
  createContext,
  generateToken,
  requireAuth
};

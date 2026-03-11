// src/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';

import env from '../config/env.js';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn('PROTECT: No token provided. Denying access.');
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      profile_id: decoded.profile_id,
      role: decoded.role
    };

    next();
  } 
  catch (error) {
    console.error('PROTECT: Token verification failed:', error.message);
    res.status(403).json({ message: 'Not authorized, token failed or expired.' });
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user ? req.user.role : "undefined";
    const isAuthorized = req.user && roles.includes(userRole);

    if (!req.user || !isAuthorized) {
      console.warn(`AUTHORIZATION DENIED: User role '${userRole}' is not authorized. Expected: [${roles.join(', ')}]`);
      return res.status(403).json({ message: `User role '${userRole}' is not authorized to access this route.` });
    }
    next();
  };
}
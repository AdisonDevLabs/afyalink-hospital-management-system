// server/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // Checks for token in the secure HTTPonly Cookies(Primary method)
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }
  // Fallback: Checks for token in the Authorization header (For public APIs/testing)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // --- Authentication Failure ---
  if (!token) {
    console.warn('PROTECT: Access Denied. No valid token found in cookie or header.');
    // Clear an invalid cookie if present
    res.clearCookie('auth_token');
    return res.status(401).json({
      message: 'Not authorized, access token required.' });
  }

  // --- Token Verification ---
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload (user info, including role) to the request object
    req.user = decoded;
    next();
  } 
  catch (error) {
    // If verification fails (expired, invalid_signature, etc)
    console.error('PROTECT: Token verification failed:', error.message);
    res.clearCookie('auth_token');
    res.status(403).json({
      message: 'Not authorized. Invalid or expired.'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    const isAuthorized = req.user && roles.includes(req.user.role);

    if (!req.user || !isAuthorized) {
      console.warn(`AUTHORIZATION DENIED: User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route. Expected roles: [${roles.join(', ')}]`);
      
      return res.status(403).json({
        message: 'Access Denied. You do not have the required permissions.'
      });
    }
    next();
  };
};
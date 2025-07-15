// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn('PROTECT: No token provided. Denying access.'); // Add log
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    req.user = decoded; // This will contain { id, username, role }
    //console.log('PROTECT: Token verified. User attached to req.user:', req.user); // Add log
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('PROTECT: Token verification failed:', error.message); // Add log
    res.status(403).json({ message: 'Not authorized, token failed or expired.' });
  }
};

// Middleware for Role-Based Access Control (RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    //console.log('--- DEBUG: AUTHORIZE Middleware ---');
    //console.log('Request URL (from authorize):', req.originalUrl, 'Method:', req.method); // Identify the route that triggered this
    //console.log('User object from req.user (should be populated by protect):', req.user);
    //console.log('User Role (from req.user.role):', req.user ? req.user.role : 'UNDEFINED or NULL');
    //console.log('Roles allowed for THIS route:', roles);
    const isAuthorized = req.user && roles.includes(req.user.role);
    //console.log('Is user role AUTHORIZED for this route?', isAuthorized);


    if (!req.user || !isAuthorized) {
      console.warn(`AUTHORIZATION DENIED: User role '<span class="math-inline">\{req\.user ? req\.user\.role \: "undefined"\}' is not authorized to access this route\. Expected roles\: \[</span>{roles.join(', ')}]`);
      return res.status(403).json({ message: `User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route.` });
    }
    console.log('AUTHORIZATION GRANTED for user role:', req.user.role);
    next();
  };
};
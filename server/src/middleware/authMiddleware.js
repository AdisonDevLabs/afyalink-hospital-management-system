const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {

  if (req.isDemoMode) {
    req.user = { id: 0, role: 'guest_demo', username: 'demo_user' };
    console.log('PROTECT: Bypassing authentication for Demo Mode GET request. Assigned role: guest_demo')
    return next();
  }

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn('PROTECT: No token provided. Denying access.'); // Add log
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } 
  catch (error) {
    console.error('PROTECT: Token verification failed:', error.message); // Add log
    res.status(403).json({ message: 'Not authorized, token failed or expired.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    const isAuthorized = req.user && roles.includes(req.user.role);

    if (!req.user || !isAuthorized) {
      console.warn(`AUTHORIZATION DENIED: User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route. Expected roles: [${roles.join(', ')}]`);
      
      return res.status(403).json({ message: `User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route.` });
    }
    next();
  };
};
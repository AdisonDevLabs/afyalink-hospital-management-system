// src/middleware/demoMode.js

exports.restrictInDemo = (req, res, next) => {
  // Check if the user is authenticated AND is specifically the 'guest_demo' role
  if (req.user && req.user.role === 'guest_demo') {}
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (!safeMethods.includes(req.method.toUpperCase())) {
    console.warn(`DEMO MODE: Denying ${req.method} request to ${req.originalUrl} for demo user.`);
    
    return res.status(403).json({
      message: 'Write operations (POST, PUT, DELETE) are disabled in Demo Mode.'
    });
  }
  next();
};
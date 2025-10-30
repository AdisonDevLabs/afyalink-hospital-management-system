// src/middleware/demoMode.js
/**
 * Middleware to restrict non-GET and sensitive operations in demo mode.
 * This should be placed at the very beginning of the Express middleware chain.
 * Note: The current server.js implementation uses a `restrictInDemo` placeholder, 
 * so we'll use that name, but rename the export here to `restrictInDemo` 
 * to align with the provided `server.js`.
 */
exports.restrictInDemo = (req, res, next) => {
  req.isDemoMode = true;

  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (!safeMethods.includes(req.method.toUpperCase())) {
    console.warn(`DEMO MODE: Denying ${req.method} request to ${req.originalUrl}`);
    return res.status(403).json({
      message: 'Write operations (POST, PUT, DELETE) are disabled in Demo Mode.'
    });
  }
  next();
};
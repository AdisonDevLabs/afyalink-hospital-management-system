// src/middleware/demoMode.js

/**
 * Middleware to check for the '/demo' prefix, rewrite the URL, 
 * and set a flag on the request object for demo mode.
 */
exports.handleDemoPrefix = (req, res, next) => {
  // Check if the request path starts with /demo/
  if (req.originalUrl.startsWith('/demo/api/')) {
    // 1. Set the demo flag
    req.isDemoMode = true;
    
    // 2. Rewrite the URL by stripping the '/demo' prefix.
    // e.g., '/demo/api/users' becomes '/api/users'
    req.url = req.originalUrl.substring(5); // '/demo'.length is 5
    
    console.log(`DEMO MODE: Rewriting URL from ${req.originalUrl} to ${req.url}`);
  } else {
    req.isDemoMode = false;
  }
  
  next();
};

/**
 * Middleware to restrict non-GET and sensitive operations in demo mode.
 * This should be placed at the very beginning of the Express middleware chain.
 * Note: The current server.js implementation uses a `restrictInDemo` placeholder, 
 * so we'll use that name, but rename the export here to `restrictInDemo` 
 * to align with the provided `server.js`.
 */
exports.restrictInDemo = (req, res, next) => {
    // We can add more comprehensive WRITE restrictions in the controllers,
    // but this check in the router is for any endpoint that might be exposed.
    // Since we are moving the URL rewriting to this function as well to be the first one,
    // we should combine the logic.
    
    if (req.originalUrl.startsWith('/demo/api/')) {
        req.isDemoMode = true;
        req.url = req.originalUrl.substring(5); // Strip '/demo'
    } else {
        req.isDemoMode = false;
    }
    
    if (req.isDemoMode) {
        // Only allow safe HTTP methods (GET, HEAD, OPTIONS)
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
        if (!safeMethods.includes(req.method.toUpperCase())) {
            console.warn(`DEMO MODE: Denying ${req.method} request to ${req.originalUrl}`);
            return res.status(403).json({ 
                message: 'Write operations (POST, PUT, DELETE) are disabled in Demo Mode.' 
            });
        }
    }

    next();
};
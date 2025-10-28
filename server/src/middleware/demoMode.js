// middlewares/demoMode.js
// Assuming you load environment variables (like DEMO_MODE) globally in your entry file
// or you use require('dotenv').config() in your main app file.

exports.restrictInDemo = (req, res, next) => {
  // Check if DEMO_MODE is set to 'true' AND the request method is one that modifies data
  if (process.env.DEMO_MODE === "true" && ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    // We also include PATCH, as it modifies data
    return res.status(403).json({ 
      message: "Demo Mode: Write and modification operations are disabled." 
    });
  }
  next();
};
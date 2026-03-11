// src/middleware/validationMiddleware.js

export const validate = (schema) => (req, res, next) => {
  const validationResult = schema.safeParse(req.body);

  // If validation fails, send a 400 response with error details
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors
    });
  }

  // If validation succeeds, replace req.body with the sanitized data
  req.body = validationResult.data;

  next();
};
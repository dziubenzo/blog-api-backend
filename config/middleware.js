const isValidObjectId = require('mongoose').isValidObjectId;

// Return error if path parameter is not a valid ObjectId
exports.checkIdParameter = (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: 'Invalid path parameter.',
    });
  }
  next();
};

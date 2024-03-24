const isValidObjectId = require('mongoose').isValidObjectId;

// Return error if post path parameter is not a valid ObjectId
// Make an exception for "all" for the GET all comments route to work
exports.checkPostIdPath = (req, res, next) => {
  if (req.params.id === 'all') {
    return next();
  }
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: 'Invalid post path parameter.',
    });
  }
  next();
};

// Return error if comment path parameter is not a valid ObjectId
exports.checkCommentIdPath = (req, res, next) => {
  if (!isValidObjectId(req.params.commentId)) {
    return res.status(400).json({
      error: 'Invalid comment path parameter.',
    });
  }
  next();
};

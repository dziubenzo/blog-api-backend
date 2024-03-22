const Comment = require('../models/Comment');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.get_all_comments = asyncHandler(async (req, res, next) => {
  const postID = req.params.id;
  // Get all post comments from DB
  const allComments = await Comment.find({ post: postID })
    .sort({ create_date: -1 })
    .lean()
    .exec();
  // Return error message if no posts
  if (!allComments.length) {
    return res.status(404).json({
      error: 'No comments to show.',
    });
  }
  // Return all comments otherwise
  return res.json(allComments);
});

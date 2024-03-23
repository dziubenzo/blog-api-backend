const Comment = require('../models/Comment');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const getErrorMessages = require('../config/helpers').getErrorMessages;
const checkCommentIdPath = require('../config/middleware').checkCommentIdPath;

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

exports.create_comment = [
  // Validate and sanitise comment form fields
  body(
    'author',
    'Comment author field must contain between 3 and 64 characters.'
  )
    .trim()
    .isLength({ min: 3, max: 64 }),

  body('content', 'Comment content field must contain at least 3 characters.')
    .trim()
    .isLength({ min: 3 }),

  body(
    'avatar_colour',
    'Comment avatar colour field must contain 7 characters at the maximum and be a hex colour.'
  )
    .trim()
    .isLength({ max: 7 }),

  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request
    const errors = validationResult(req);

    const defaultColour = '#FFB937';
    const postId = req.params.id;
    const author = req.body.author;
    const content = req.body.content;
    const avatarColour = req.body.avatar_colour || defaultColour;

    // Create new comment
    const comment = new Comment({
      post: postId,
      author: author,
      content: content,
      avatar_colour: avatarColour,
    });

    // Return error message(s) if something is wrong
    if (!errors.isEmpty()) {
      const errorMsgs = getErrorMessages(errors);
      return res.status(400).json(errorMsgs);
    } else {
      // Save comment and return success message
      await comment.save();
      return res.json({
        message: 'Comment created successfully.',
      });
    }
  }),
];

exports.edit_comment = [
  checkCommentIdPath,
  // Validate and sanitise comment form fields
  body(
    'author',
    'Comment author field must contain between 3 and 64 characters.'
  )
    .trim()
    .isLength({ min: 3, max: 64 }),

  body('content', 'Comment content field must contain at least 3 characters.')
    .trim()
    .isLength({ min: 3 }),

  body(
    'avatar_colour',
    'Comment avatar colour field must contain 7 characters at the maximum and be a hex colour.'
  )
    .trim()
    .isLength({ max: 7 }),

  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request
    const errors = validationResult(req);

    const defaultColour = '#FFB937';
    const commentId = req.params.commentId;
    const author = req.body.author;
    const content = req.body.content;
    const avatarColour = req.body.avatar_colour || defaultColour;

    // Create an edited comment object
    const editedComment = {
      author: author,
      content: content,
      avatar_colour: avatarColour,
    };

    // Return error message(s) if something is wrong
    if (!errors.isEmpty()) {
      const errorMsgs = getErrorMessages(errors);
      return res.status(400).json(errorMsgs);
    } else {
      // Update comment and return success message
      await Comment.findByIdAndUpdate(commentId, editedComment);
      return res.json({
        message: 'Comment edited successfully.',
      });
    }
  }),
];

exports.delete_comment = [
  checkCommentIdPath,
  asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;
    // Delete comment and return message depending on whether or not the comment was found
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({
        error: 'No comment to delete.',
      });
    }
    return res.json({
      message: 'Comment deleted successfully.',
    });
  }),
];

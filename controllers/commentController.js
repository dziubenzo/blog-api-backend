const Comment = require('../models/Comment');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const getErrorMessages = require('../config/helpers').getErrorMessages;
const checkCommentIdPath = require('../config/middleware').checkCommentIdPath;

exports.get_post_comments = asyncHandler(async (req, res, next) => {
  const postID = req.params.id;
  // Get post comments from DB
  const postComments = await Comment.find({ post: postID })
    .sort({ create_date: -1 })
    .lean()
    .exec();
  // Return error message if no posts
  if (!postComments.length) {
    return res.status(404).json({
      error: 'No comments to show.',
    });
  }
  // Return post comments otherwise
  return res.json(postComments);
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
    .isLength({ min: 3, max: 320 }),

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
      create_date: Date.now(),
      avatar_colour: avatarColour,
    });

    // Return error message(s) if something is wrong
    if (!errors.isEmpty()) {
      const errorMsgs = getErrorMessages(errors);
      return res.status(400).json(errorMsgs);
    } else {
      // Save comment and return it
      await comment.save();
      return res.json(comment);
    }
  }),
];

exports.get_all_comments = asyncHandler(async (req, res, next) => {
  // Get all comments from DB
  const allComments = await Comment.find()
    .sort({ create_date: -1 })
    .lean()
    .exec();
  // Return error message if no comments
  if (!allComments.length) {
    return res.status(404).json({
      error: 'No comments in the DB.',
    });
  }
  // Return all comments otherwise
  return res.json(allComments);
});

exports.get_comment = asyncHandler(async (req, res, next) => {
  // Get post comment from DB
  const commentId = req.params.commentId;
  const comment = await Comment.findOne({ _id: commentId }).lean().exec();
  // Return error message if no comment
  if (!comment) {
    return res.status(404).json({
      error: 'No comment in the DB.',
    });
  }
  // Return comment otherwise
  return res.json(comment);
});

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

exports.like_comment = [
  checkCommentIdPath,
  asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;
    // Add a like to the comment and return success message
    await Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } });
    return res.json({
      message: 'Comment liked successfully.',
    });
  }),
];

exports.unlike_comment = [
  checkCommentIdPath,
  asyncHandler(async (req, res, next) => {
    const commentId = req.params.commentId;
    // Get comment likes from DB
    const { likes } = await Comment.findOne(
      { _id: commentId },
      '-_id likes'
    ).exec();
    // Return error if there are no likes
    if (likes === 0) {
      return res.status(400).json({
        error: 'Comment has no likes.',
      });
    }
    // Subtract a like from the comment and return success message
    await Comment.findByIdAndUpdate(commentId, { $inc: { likes: -1 } });
    return res.json({
      message: 'Comment unliked successfully.',
    });
  }),
];

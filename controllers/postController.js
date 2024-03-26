const Post = require('../models/Post');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const slugify = require('slugify');
const getErrorMessages = require('../config/helpers').getErrorMessages;
const checkPostIdPath = require('../config/middleware').checkPostIdPath;

exports.get_all_posts = asyncHandler(async (req, res, next) => {
  // Get all posts from DB
  const allPosts = await Post.find({}).sort({ create_date: -1 }).lean().exec();
  // Return error message if no posts
  if (!allPosts.length) {
    return res.status(404).json({
      error: 'No posts to show.',
    });
  }
  // Return all posts otherwise
  return res.json(allPosts);
});

exports.create_post = [
  // Validate and sanitise post form fields
  body('title', 'Post title field must contain between 3 and 160 characters.')
    .trim()
    .isLength({ min: 3, max: 160 }),

  body('content', 'Post content field must contain at least 3 characters.')
    .trim()
    .isLength({ min: 3 }),

  body('author', 'Post author field must contain between 3 and 64 characters.')
    .trim()
    .isLength({ min: 3, max: 64 }),

  body('published', 'Post publish value must be either true or false').custom(
    (value) => {
      const allowedValues = ['true', 'false'];
      return allowedValues.includes(value.toString()) ? true : false;
    }
  ),

  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request
    const errors = validationResult(req);

    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    const published = req.body.published;

    // Create new post
    const post = new Post({
      title: title,
      content: content,
      author: author,
      create_date: Date.now(),
      update_date: Date.now(),
      published: published,
      slug: slugify(title, { lower: true }),
    });

    // Return error message(s) if something is wrong
    if (!errors.isEmpty()) {
      const errorMsgs = getErrorMessages(errors);
      return res.status(400).json(errorMsgs);
    } else {
      // Check if the post with the same title already exists
      const postExists = await Post.findOne({ title: title }).exec();
      // If it does, return error
      if (postExists) {
        return res.status(400).json({
          error: 'Post title already taken. Try a different title.',
        });
      } else {
        // Save post and return success message
        await post.save();
        return res.json({
          message: 'Post created successfully.',
        });
      }
    }
  }),
];

exports.publish_all_posts = asyncHandler(async (req, res, next) => {
  // Update all unpublished posts to published
  const result = await Post.updateMany(
    { published: false },
    { published: true }
  );
  // Return error message if no documents were updated
  if (result.modifiedCount === 0) {
    return res.status(400).json({
      error: 'No documents to update.',
    });
  }
  // Return success message otherwise
  return res.json({
    message: `Documents published successfully. Count: ${result.modifiedCount}.`,
  });
});

exports.unpublish_all_posts = asyncHandler(async (req, res, next) => {
  // Update all published posts to unpublished
  const result = await Post.updateMany(
    { published: true },
    { published: false }
  );
  // Return error message if no documents were updated
  if (result.modifiedCount === 0) {
    return res.status(400).json({
      error: 'No documents to update.',
    });
  }
  // Return success message otherwise
  return res.json({
    message: `Documents unpublished successfully. Count: ${result.modifiedCount}.`,
  });
});

exports.get_post = [
  checkPostIdPath,
  asyncHandler(async (req, res, next) => {
    // Get id from path parameter
    const postId = req.params.id;

    // Get post from DB
    const post = await Post.findOne({ _id: postId }).lean().exec();

    // Return error if post not found
    if (!post) {
      return res.status(400).json({
        error: 'Post not found.',
      });
    }
    // Return post otherwise
    return res.json(post);
  }),
];

exports.edit_post = [
  checkPostIdPath,
  // Validate and sanitise post form fields
  body('title', 'Post title field must contain between 3 and 160 characters.')
    .trim()
    .isLength({ min: 3, max: 160 }),

  body('content', 'Post content field must contain at least 3 characters.')
    .trim()
    .isLength({ min: 3 }),

  body('author', 'Post author field must contain between 3 and 64 characters.')
    .trim()
    .isLength({ min: 3, max: 64 }),

  body('published', 'Post publish value must be either true or false').custom(
    (value) => {
      const allowedValues = ['true', 'false'];
      return allowedValues.includes(value.toString()) ? true : false;
    }
  ),

  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request
    const errors = validationResult(req);

    const postId = req.params.id;
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    const published = req.body.published;

    // Create an edited post object with updated update_date
    const editedPost = {
      title: title,
      content: content,
      author: author,
      update_date: Date.now(),
      published: published,
      slug: slugify(title, { lower: true }),
    };

    // Return error message(s) if something is wrong
    if (!errors.isEmpty()) {
      const errorMsgs = getErrorMessages(errors);
      return res.status(400).json(errorMsgs);
    } else {
      // Update post and return success message
      await Post.findByIdAndUpdate(postId, editedPost);
      return res.json({
        message: 'Post edited successfully.',
      });
    }
  }),
];

exports.delete_post = [
  checkPostIdPath,
  asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    // Delete post and return message depending on whether or not the post was found
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({
        error: 'No post to delete.',
      });
    }
    return res.json({
      message: 'Post deleted successfully.',
    });
  }),
];

exports.like_post = [
  checkPostIdPath,
  asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    // Add a like to the post and return success message
    await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });
    return res.json({
      message: 'Post liked successfully.',
    });
  }),
];

exports.unlike_post = [
  checkPostIdPath,
  asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    // Get post likes from DB
    const { likes } = await Post.findOne({ _id: postId }, '-_id likes').exec();
    // Return error if there are no likes
    if (likes === 0) {
      return res.status(400).json({
        error: 'Post has no likes.',
      });
    }
    // Subtract a like from the post and return success message
    await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
    return res.json({
      message: 'Post unliked successfully.',
    });
  }),
];

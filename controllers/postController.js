const Post = require('../models/Post');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const slugify = require('slugify');
const checkIdParameter = require('../config/middleware').checkIdParameter;

exports.get_all_posts = asyncHandler(async (req, res, next) => {
  // Get all posts from DB
  const allPosts = await Post.find({}).sort({ create_date: -1 }).exec();
  // Send error message if no posts
  if (!allPosts.length) {
    return res.json({
      error: 'No posts to show.',
    });
  }
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
      published: published,
      slug: slugify(title, { lower: true }),
    });

    // Return error(s) if something is wrong
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
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

exports.get_post = [
  checkIdParameter,
  asyncHandler(async (req, res, next) => {
    // Get id from path parameter
    const postId = req.params.id;

    // Get post from DB
    const post = await Post.findOne({ _id: postId });

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
  checkIdParameter,
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

    // Return error(s) if something is wrong
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
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
  checkIdParameter,
  asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    // Delete post and return message depending on whether or not the post was found
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({
        message: 'No post to delete.',
      });
    }
    return res.json({
      message: 'Post deleted successfully.',
    });
  }),
];

exports.like_post = [
  checkIdParameter,
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
  checkIdParameter,
  asyncHandler(async (req, res, next) => {
    const postId = req.params.id;
    // Get post likes from DB
    const { likes } = await Post.findOne({ _id: postId }, '-_id likes').exec();
    // Return error if there are no likes
    if (likes === 0) {
      return res.status(400).json({
        message: 'Post has no likes.',
      });
    }
    // Subtract a like from the post and return success message
    await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });
    return res.json({
      message: 'Post unliked successfully.',
    });
  }),
];

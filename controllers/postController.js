const Post = require('../models/Post');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const slugify = require('slugify');
const isValidObjectId = require('mongoose').isValidObjectId;

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

exports.get_post = asyncHandler(async (req, res, next) => {
  // Get id from path parameter
  const postId = req.params.id;

  // Return error if path parameter is not a valid ObjectId
  if (!isValidObjectId(postId)) {
    return res.status(400).json({
      error: 'Invalid path parameter.',
    });
  }
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
});

exports.edit_post = [
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

    // Return error if path parameter is not a valid ObjectId
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        error: 'Invalid path parameter.',
      });
    }

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
      await Post.findByIdAndUpdate(postId, editedPost);
      return res.json({
        message: 'Post edited successfully.',
      });
    }
  }),
];

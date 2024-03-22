const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

// GET get all posts
router.get('/', postController.get_all_posts);

// POST create post
router.post('/', postController.create_post);

// GET get post
router.get('/:id', postController.get_post);

// // PUT edit post
// router.put('/:id', postController.edit_post);

// // DELETE delete post
// router.delete('/:id', postController.delete_post);

// // POST like post
// router.post('/:id/like', postController.like_post);

module.exports = router;

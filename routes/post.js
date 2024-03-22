const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

// GET get all posts
router.get('/', postController.get_all_posts);

// POST create post
router.post('/', postController.create_post);

// PUT publish all unpublished posts
router.put('/publish-all', postController.publish_all_posts);

// PUT unpublish all published posts
router.put('/unpublish-all', postController.unpublish_all_posts);

// GET get post
router.get('/:id', postController.get_post);

// PUT edit post
router.put('/:id', postController.edit_post);

// DELETE delete post
router.delete('/:id', postController.delete_post);

// PUT like post
router.put('/:id/like', postController.like_post);

// PUT unlike post
router.put('/:id/unlike', postController.unlike_post);

module.exports = router;

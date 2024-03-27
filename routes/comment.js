const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');

const commentController = require('../controllers/commentController');
const checkPostIdPath = require('../config/middleware').checkPostIdPath;

router.use(checkPostIdPath);

// GET get post comments
router.get('/', commentController.get_post_comments);

// POST create post comment
router.post('/', commentController.create_comment);

// GET get all comments
router.get('/all', commentController.get_all_comments);

// PUT edit post comment
router.put('/:commentId', [
  passport.authenticate('jwt', { session: false }),
  commentController.edit_comment,
]);

// DELETE delete post comment
router.delete('/:commentId', [
  passport.authenticate('jwt', { session: false }),
  commentController.delete_comment,
]);

// PUT like post comment
router.put('/:commentId/like', commentController.like_comment);

// PUT unlike post comment
router.put('/:commentId/unlike', commentController.unlike_comment);

module.exports = router;

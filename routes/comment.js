const express = require('express');
const router = express.Router({ mergeParams: true });

const commentController = require('../controllers/commentController');
const checkPostIdPath = require('../config/middleware').checkPostIdPath;

router.use(checkPostIdPath);

// GET get all post comments
router.get('/', commentController.get_all_comments);

// POST create post comment
router.post('/', commentController.create_comment);

// PUT edit post comment
router.put('/:commentId', commentController.edit_comment);

// // DELETE delete post comment
// router.delete('/:commentId', commentController.delete_comment);

// // PUT like post comment
// router.put('/:commentId/like', commentController.like_comment);

// // PUT unlike post comment
// router.put('/:commentId/unlike', commentController.unlike_comment);

module.exports = router;

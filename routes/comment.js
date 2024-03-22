const express = require('express');
const router = express.Router({ mergeParams: true });

const commentController = require('../controllers/commentController');
const checkIdParameter = require('../config/middleware').checkIdParameter;

router.use(checkIdParameter);

// GET get all post comments
router.get('/', commentController.get_all_comments);

// POST create post comment
router.post('/', commentController.create_comment);

// // PUT edit post comment
// router.put('/:id', commentController.edit_comment);

// // DELETE edit post comment
// router.delete('/:id', commentController.delete_comment);

// // PUT like post comment
// router.put('/:id/like', commentController.like_comment);

// // PUT unlike post comment
// router.put('/:id/unlike', commentController.unlike_comment);

module.exports = router;

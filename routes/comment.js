const express = require('express');
const router = express.Router({ mergeParams: true });

const commentController = require('../controllers/commentController');
const checkIdParameter = require('../config/middleware').checkIdParameter;

router.use(checkIdParameter);

// GET get all post comments
router.get('/', commentController.get_all_comments);

module.exports = router;

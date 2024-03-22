const express = require('express');
const router = express.Router();

const indexController = require('../controllers/indexController');

// ALL home page
router.all('/', indexController.index);

module.exports = router;

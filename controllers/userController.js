const User = require('../models/User');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { getErrorMessages } = require('../config/helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.log_in = [
  // Validate and sanitise login form fields
  body('username', 'Username field must contain between 1 and 16 characters.')
    .trim()
    .isLength({ min: 1, max: 16 }),

  body('password', 'Password field must contain between 1 and 16 characters.')
    .trim()
    .isLength({ min: 1, max: 16 }),

  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request
    const errors = validationResult(req);

    const usernameForm = req.body.username;
    const passwordForm = req.body.password;

    // Return error message(s) if something is wrong
    if (!errors.isEmpty()) {
      const errorMsgs = getErrorMessages(errors);
      return res.status(400).json(errorMsgs);
    }
    // Get the only user in the DB
    const { _id, username, password } = await User.findOne({}).lean().exec();
    // Compare passwords
    const passwordsMatch = await bcrypt.compare(passwordForm, password);
    // Create token valid for 1 day if username and password match
    // Use user's ID as payload
    if (usernameForm === username && passwordsMatch) {
      const options = { expiresIn: '1 day' };
      const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, options);
      // Return token
      return res.json({
        token,
      });
    }
    // // Otherwise return error message
    return res.status(401).json({ error: 'Authentication failed...' });
  }),
];

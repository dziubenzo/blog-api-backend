const User = require('../models/User');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

exports.log_in = (req, res) => {
  return res.json({
    status: 'TODO',
  });
};

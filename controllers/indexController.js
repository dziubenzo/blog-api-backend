const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
  return res.json({
    title: 'Blog API',
    author: 'dziubenzo',
    course: 'The Odin Project',
  });
});

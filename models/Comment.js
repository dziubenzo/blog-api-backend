const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  author: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 64,
  },
  content: {
    type: String,
    required: true,
    minLength: 3,
  },
  create_date: {
    type: Date,
    default: Date.now(),
  },
  likes: {
    type: Number,
    min: 0,
    default: 0,
  },
  // Avatar colour accent
  avatar_colour: {
    type: String,
    maxLength: 8,
    default: '#FFB937',
  },
});

module.exports = mongoose.model('Comment', CommentSchema);

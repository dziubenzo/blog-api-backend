const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 160,
    unique: true,
  },
  content: {
    type: String,
    required: true,
    minLength: 3,
  },
  author: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 64,
  },
  create_date: {
    type: Date,
    default: Date.now(),
  },
  update_date: {
    type: Date,
    default: Date.now(),
  },
  published: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    min: 0,
    default: 0,
  },
  slug: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 200,
  },
});

module.exports = mongoose.model('Post', PostSchema);

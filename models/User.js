const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 16,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 100,
    unique: true,
  },
});

module.exports = mongoose.model('User', UserSchema);

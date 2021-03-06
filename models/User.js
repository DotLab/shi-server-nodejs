const mongoose = require('mongoose');

module.exports = mongoose.model('User', {
  userName: String,
  displayName: String,
  email: String,

  passwordSalt: String,
  passwordSha256: String,

  followingCount: Number,
  followerCount: Number,

  lastActiveDate: Date,
  viewCount: Number,
});

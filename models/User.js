const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('User', {
  userName: String,
  displayName: String,
  email: String,

  passwordSalt: String,
  passwordSha256: String,

  followingCount: Number,
  following: [{userId: ObjectId}],
  followerCount: Number,
  follower: [{userId: ObjectId}],
});

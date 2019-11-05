const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Comment', {
  poemAuthorId: ObjectId,
  commentAuthorId: ObjectId,
  poemId: ObjectId,
  body: String,
  date: Date,
});

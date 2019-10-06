const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Comment', {
  poemAuthor: ObjectId,
  commentAuthor: ObjectId,
  poem: ObjectId,
  body: String,
  date: Date,
});


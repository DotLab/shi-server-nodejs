const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Poem', {
  author: ObjectId,
  title: String,
  body: String,
  writtenDate: Date,
  lastEditDate: Date,
  privacy: String,
  likeCount: Number,
  viewCount: Number,
});

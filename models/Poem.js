const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const {PUBLIC, PRIVATE, COMMUNITY, TEXT_ALIGN_CENTER, TEXT_ALIGN_END, TEXT_ALIGN_START} = require('../controllers/utils');

module.exports = mongoose.model('Poem', {
  authorId: ObjectId,
  title: String,
  body: String,
  writtenDate: Date,
  lastEditDate: Date,
  align: {type: String, enum: [TEXT_ALIGN_CENTER, TEXT_ALIGN_END, TEXT_ALIGN_START]},
  visibility: {type: String, enum: [PUBLIC, COMMUNITY, PRIVATE]},
  likeCount: Number,
  viewCount: Number,
});

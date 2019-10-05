const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Poem', {
  author: ObjectId,
  title: String,
  body: String,
  dateUploaded: Date,
  public: String,
});


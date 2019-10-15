const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('UserLikedPoem', {
  user: ObjectId,
  poem: ObjectId,
});
